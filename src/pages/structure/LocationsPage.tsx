import { useState } from "react";
import { MapPin, Plus, Trash2, Edit, ExternalLink, ChevronDown, ChevronRight, X, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Field {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  googleMapsLink: string;
  fields: Field[];
}

const initialLocations: Location[] = [
  {
    id: "1",
    name: "Memorial Park",
    googleMapsLink: "https://maps.google.com/?q=Memorial+Park",
    fields: [
      { id: "f1", name: "Field 1" },
      { id: "f2", name: "Field 2" },
      { id: "f3", name: "Field 3" },
    ],
  },
  {
    id: "2",
    name: "Central Park Complex",
    googleMapsLink: "https://maps.google.com/?q=Central+Park",
    fields: [
      { id: "f4", name: "Field A" },
      { id: "f5", name: "Field B" },
    ],
  },
  {
    id: "3",
    name: "Riverside Athletic Center",
    googleMapsLink: "https://maps.google.com/?q=Riverside+Athletic+Center",
    fields: [
      { id: "f6", name: "Field 1" },
    ],
  },
  {
    id: "4",
    name: "Northside Sports Complex",
    googleMapsLink: "https://maps.google.com/?q=Northside+Sports+Complex",
    fields: [
      { id: "f7", name: "North" },
      { id: "f8", name: "South" },
      { id: "f9", name: "East" },
      { id: "f10", name: "West" },
    ],
  },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formFields, setFormFields] = useState<string[]>([""]);

  const resetForm = () => {
    setFormName("");
    setFormLink("");
    setFormFields([""]);
    setShowForm(false);
    setEditingId(null);
  };

  const openEdit = (loc: Location) => {
    setFormName(loc.name);
    setFormLink(loc.googleMapsLink);
    setFormFields(loc.fields.map(f => f.name));
    setEditingId(loc.id);
    setShowForm(true);
  };

  const addFieldRow = () => setFormFields([...formFields, ""]);

  const removeFieldRow = (i: number) => {
    if (formFields.length <= 1) return;
    setFormFields(formFields.filter((_, idx) => idx !== i));
  };

  const updateFieldRow = (i: number, val: string) => {
    const next = [...formFields];
    next[i] = val;
    setFormFields(next);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    const fields: Field[] = formFields
      .filter(f => f.trim())
      .map((f, i) => ({ id: `new-${Date.now()}-${i}`, name: f.trim() }));

    if (editingId) {
      setLocations(locations.map(l =>
        l.id === editingId ? { ...l, name: formName.trim(), googleMapsLink: formLink.trim(), fields } : l
      ));
    } else {
      setLocations([...locations, {
        id: `loc-${Date.now()}`,
        name: formName.trim(),
        googleMapsLink: formLink.trim(),
        fields,
      }]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const totalFields = locations.reduce((s, l) => s + l.fields.length, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locations & Fields</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {locations.length} location{locations.length !== 1 ? "s" : ""} · {totalFields} field{totalFields !== 1 ? "s" : ""} configured
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Location
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="section-card p-5 space-y-4 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {editingId ? "Edit Location" : "New Location"}
            </h2>
            <button onClick={resetForm} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Location Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Memorial Park"
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Google Maps Link</label>
              <input
                type="url"
                value={formLink}
                onChange={e => setFormLink(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Fields / Sub-fields</label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
              Add each playable field at this location (e.g. Field 1, Field 2 or North, South).
            </p>
            <div className="space-y-2">
              {formFields.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={f}
                    onChange={e => updateFieldRow(i, e.target.value)}
                    placeholder={`Field ${i + 1}`}
                    className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    onClick={() => removeFieldRow(i)}
                    disabled={formFields.length <= 1}
                    className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addFieldRow}
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1 mt-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add another field
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={resetForm}
              className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formName.trim()}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {editingId ? "Save Changes" : "Add Location"}
            </button>
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="space-y-3">
        {locations.map(loc => (
          <div key={loc.id} className="section-card overflow-hidden">
            <div
              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => setExpandedId(expandedId === loc.id ? null : loc.id)}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{loc.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {loc.fields.length} field{loc.fields.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-3">
                  {loc.fields.map(f => (
                    <Badge key={f.id} variant="secondary" className="text-xs">{f.name}</Badge>
                  ))}
                </div>
                {expandedId === loc.id ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedId === loc.id && (
              <div className="border-t border-border px-5 py-4 bg-secondary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    {loc.googleMapsLink && (
                      <a
                        href={loc.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary font-medium flex items-center gap-1.5 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(loc); }}
                      className="h-8 px-3 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(loc.id); }}
                      className="h-8 px-3 rounded-md border border-border bg-card text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fields</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {loc.fields.map(f => (
                    <div key={f.id} className="bg-card rounded-lg border border-border px-3 py-2.5 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                      <span className="text-sm font-medium text-foreground">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {locations.length === 0 && (
          <div className="section-card p-12 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">No locations yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Add your first location to start scheduling games.</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="mt-4 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
