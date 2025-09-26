"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type MenuStatus = 'loading' | 'exists' | 'empty' | 'error';
type BuilderItem = { name: string; description: string; price: string };
type BuilderSection = { name: string; items: BuilderItem[] };
type MenuData = {
  id: string;
  name: string;
  categories: {
    id: string;
    name: string;
    menuItems: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      isAvailable: boolean;
    }[];
  }[];
};

export default function MenuPage() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email as string | undefined;
  const [status, setStatus] = useState<MenuStatus>('loading');
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const checkedRef = useRef<Set<string>>(new Set());
  const groupedSections = useMemo(() => {
    if (!menuData) return [] as { name: string; items: MenuData["categories"][number]["menuItems"] }[];
    const map = new Map<string, { name: string; items: MenuData["categories"][number]["menuItems"] }>();
    for (const cat of menuData.categories) {
      const key = cat.name.trim().toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.items = [...existing.items, ...cat.menuItems];
      } else {
        map.set(key, { name: cat.name, items: [...cat.menuItems] });
      }
    }
    return Array.from(map.values());
  }, [menuData]);

  useEffect(() => {
    if (!email || checkedRef.current.has(email)) return;
    let cancelled = false;

    fetch(`/api/menu/get?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.menu) {
          const hasItems = data.menu.categories.some((cat: any) => cat.menuItems.length > 0);
          setStatus(hasItems ? 'exists' : 'empty');
          setMenuData(data.menu);
        } else {
          setStatus('empty');
          setMenuData(null);
        }
        checkedRef.current.add(email);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [email]);

  const [form, setForm] = useState({ name: "Main Menu" });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState<'menu' | 'sections'>('menu');
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const canSubmit = useMemo(() => form.name.trim().length > 1, [form]);

  const createMenu = async () => {
    if (!email || !canSubmit) return;
    const res = await fetch('/api/menu/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: form.name }),
    });
    if (res.ok) {
      setStep('sections');
    }
  };

  const addSection = () => {
    setSections((s) => [...s, { name: "", items: [] }]);
  };
  const removeSection = (idx: number) => {
    setSections((s) => s.filter((_, i) => i !== idx));
  };
  const updateSection = (idx: number, patch: Partial<BuilderSection>) => {
    setSections((s) => s.map((sec, i) => (i === idx ? { ...sec, ...patch } : sec)));
  };
  const addItem = (sIdx: number) => {
    setSections((s) => s.map((sec, i) => (i === sIdx ? { ...sec, items: [...sec.items, { name: "", description: "", price: "" }] } : sec)));
  };
  const removeItem = (sIdx: number, iIdx: number) => {
    setSections((s) => s.map((sec, i) => (i === sIdx ? { ...sec, items: sec.items.filter((_, j) => j !== iIdx) } : sec)));
  };
  const updateItem = (sIdx: number, iIdx: number, patch: Partial<BuilderItem>) => {
    setSections((s) => s.map((sec, i) => (i === sIdx ? { ...sec, items: sec.items.map((it, j) => (j === iIdx ? { ...it, ...patch } : it)) } : sec)));
  };

  const canBuild = useMemo(() => 
    sections.length > 0 && 
    sections.every(sec => 
      sec.name.trim() && 
      sec.items.length > 0 && 
      sec.items.every(it => 
        it.name.trim() && 
        it.description.trim() && 
        !!Number(it.price) && 
        Number(it.price) > 0
      )
    ), 
    [sections]
  );

  // Build a lightweight local view model for instant UI updates
  function localMenuFromSections(name: string): MenuData {
    return {
      id: "local",
      name,
      categories: sections.map((s, idx) => ({
        id: `local-cat-${idx}`,
        name: s.name.trim(),
        menuItems: s.items.map((it, j) => ({
          id: `local-item-${idx}-${j}`,
          name: it.name.trim(),
          description: it.description.trim() || null,
          price: Number(it.price),
          isAvailable: true,
        })),
      })),
    };
  }

  const buildMenu = async () => {
    if (!email || !canBuild) {
      setShowValidation(true);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Optimistic UI: close form and show immediate success, render local menu
    setShowForm(false);
    setIsEditing(false);
    setStep('menu');
    setStatus('exists');
    setMenuData(localMenuFromSections(menuData?.name || form.name || "Menu"));
    setToast({ show: true, message: 'Menu saved successfully' });

    const payload = {
      email,
      sections: sections.map((s) => ({
        name: s.name.trim(),
        items: s.items.map((it) => ({ name: it.name.trim(), description: it.description.trim() || undefined, price: Number(it.price) })),
      })),
    };
    const res = await fetch('/api/menu/builder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      // One refresh to sync server ids
      const menuRes = await fetch(`/api/menu/get?email=${encodeURIComponent(email)}`);
      const latest = await menuRes.json();
      if (latest?.menu) setMenuData(latest.menu);
    } else {
      setToast({ show: true, message: 'Failed to save menu' });
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast({ show: false, message: '' }), 2500);
    return () => clearTimeout(t);
  }, [toast.show]);

  if (isPending || status === 'loading') {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-6">
        {toast.show && (
          <div className="fixed top-4 right-4 z-50 rounded-md border bg-background px-4 py-2 text-sm shadow-md">
            {toast.message}
          </div>
        )}

        {showForm ? (
          step === 'menu' ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Menu Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="Main Menu" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button onClick={createMenu} disabled={!canSubmit}>Create Menu</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Add Sections & Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sections</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={addSection}>Add Section</Button>
                      <Button variant="outline" onClick={() => setSections((s) => s.slice(0, -1))} disabled={sections.length === 0}>Remove Section</Button>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {sections.map((section, sIdx) => (
                      <div key={sIdx} className="border rounded-lg p-4">
                        <div className="grid gap-2 mb-3">
                          <Label>Section Name *</Label>
                          <Input 
                            value={section.name} 
                            onChange={(e) => updateSection(sIdx, { name: e.target.value })} 
                            placeholder="Starters" 
                            className={showValidation && !section.name.trim() ? "border-red-500" : ""}
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Items</h5>
                          <Button size="sm" variant="outline" onClick={() => addItem(sIdx)}>Add Item</Button>
                        </div>
                        <div className="grid gap-3">
                          {section.items.map((item, iIdx) => (
                            <div key={iIdx} className="grid md:grid-cols-3 gap-3 items-end">
                              <div className="grid gap-1">
                                <Label>Name *</Label>
                                <Input 
                                  value={item.name} 
                                  onChange={(e) => updateItem(sIdx, iIdx, { name: e.target.value })} 
                                  placeholder="Paneer Tikka" 
                                  className={showValidation && !item.name.trim() ? "border-red-500" : ""}
                                />
                              </div>
                              <div className="grid gap-1">
                                <Label>Description *</Label>
                                <Input 
                                  value={item.description} 
                                  onChange={(e) => updateItem(sIdx, iIdx, { description: e.target.value })} 
                                  placeholder="Required" 
                                  className={showValidation && !item.description.trim() ? "border-red-500" : ""}
                                />
                              </div>
                              <div className="grid gap-1">
                                <Label>Price (₹) *</Label>
                                <Input 
                                  type="number" 
                                  inputMode="decimal" 
                                  value={item.price} 
                                  onChange={(e) => updateItem(sIdx, iIdx, { price: e.target.value })} 
                                  placeholder="199" 
                                  className={showValidation && (!item.price || Number(item.price) <= 0) ? "border-red-500" : ""}
                                />
                              </div>
                              <div className="md:col-span-3 flex justify-end">
                                <Button size="sm" variant="outline" onClick={() => removeItem(sIdx, iIdx)}>Remove Item</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setStep('menu'); setShowForm(false); setIsEditing(false); }}>Cancel</Button>
                    <Button onClick={isEditing ? async () => {
                      if (!email || !canBuild) {
                        setShowValidation(true);
                        return;
                      }
                      if (isSubmitting) return;
                      setIsSubmitting(true);

                      // Optimistic UI for update
                      setShowForm(false);
                      setIsEditing(false);
                      setStep('menu');
                      setStatus('exists');
                      setMenuData(localMenuFromSections(menuData?.name || form.name || "Menu"));
                      setToast({ show: true, message: 'Menu updated successfully' });

                      const payload = {
                        email,
                        sections: sections.map((s) => ({
                          name: s.name.trim(),
                          items: s.items.map((it) => ({ name: it.name.trim(), description: it.description.trim() || undefined, price: Number(it.price) })),
                        })),
                      };
                      const res = await fetch('/api/menu/builder', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                      if (res.ok) {
                        const menuRes = await fetch(`/api/menu/get?email=${encodeURIComponent(email)}`);
                        const data = await menuRes.json();
                        if (data?.menu) setMenuData(data.menu);
                      } else {
                        setToast({ show: true, message: 'Failed to update menu' });
                      }
                      setIsSubmitting(false);
                    } : buildMenu} disabled={!canBuild}>{isEditing ? 'Update Menu' : 'Save Menu'}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        ) : status === 'exists' && menuData ? (
          <div className="grid gap-6">
            <div className="flex justify-end">
                <Button variant="outline" onClick={() => { setIsEditing(true); setShowForm(true); setStep('sections'); setSections(groupedSections.map(s => ({ name: s.name, items: s.items.map(i => ({ name: i.name, description: i.description || "", price: String(i.price) })) })) ); }}>Edit Menu</Button>
            </div>

            <div className="grid gap-8">
              {groupedSections.map((category, idx) => (
                <div key={`${category.name}-${idx}`}>
                  <h2 className="text-xl font-semibold border-b pb-2 mb-4">{category.name}</h2>
                  <div className="grid gap-3">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start py-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          )}
                          {!item.isAvailable && (
                            <span className="text-xs text-red-500 mt-1 inline-block">Unavailable</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">₹{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-[60vh] flex items-center justify-center">
            <Button size="lg" onClick={() => { setIsEditing(false); setStep('sections'); setSections([{ name: "", items: [] }]); setShowForm(true); }}>Create Menu</Button>
          </div>
        )}
      </div>
    </section>
  );
}


