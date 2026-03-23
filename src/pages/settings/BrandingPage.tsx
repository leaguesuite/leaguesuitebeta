import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Upload, Palette, Type, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

const fontOptions = [
  { value: 'inter', label: 'Inter', sample: 'font-sans' },
  { value: 'roboto', label: 'Roboto', sample: 'font-sans' },
  { value: 'poppins', label: 'Poppins', sample: 'font-sans' },
  { value: 'open-sans', label: 'Open Sans', sample: 'font-sans' },
  { value: 'montserrat', label: 'Montserrat', sample: 'font-sans' },
  { value: 'lato', label: 'Lato', sample: 'font-sans' },
  { value: 'oswald', label: 'Oswald', sample: 'font-sans' },
  { value: 'raleway', label: 'Raleway', sample: 'font-sans' },
  { value: 'nunito', label: 'Nunito', sample: 'font-sans' },
  { value: 'source-sans', label: 'Source Sans 3', sample: 'font-sans' },
];

const presetColors = [
  '#1a1a2e', '#16213e', '#0f3460', '#e94560',
  '#1b4332', '#2d6a4f', '#40916c', '#52b788',
  '#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff',
  '#d00000', '#e85d04', '#faa307', '#ffba08',
  '#003049', '#d62828', '#f77f00', '#fcbf49',
  '#264653', '#2a9d8f', '#e9c46a', '#f4a261',
];

export default function BrandingPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#0f3460');
  const [alternateColor, setAlternateColor] = useState('#e94560');
  const [headingFont, setHeadingFont] = useState('montserrat');
  const [bodyFont, setBodyFont] = useState('inter');
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a PNG, JPG, SVG, or WebP file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Branding settings saved');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Branding</h1>
        <p className="text-sm text-muted-foreground">
          Customize your league's visual identity — logo, colors, and typography.
        </p>
      </div>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            League Logo
          </CardTitle>
          <CardDescription>
            Upload your league logo. Recommended: square format, at least 512×512px.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="h-28 w-28 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground/40" />
              )}
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,.webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG, or WebP. Max 5 MB.
              </p>
              {logoPreview && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setLogoPreview(null)}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Brand Colors
          </CardTitle>
          <CardDescription>
            Set your primary and alternate brand colors. These are used across your public site and admin interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Color */}
          <div className="space-y-3">
            <Label className="font-medium">Primary Color</Label>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-lg border border-border shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-32 font-mono text-sm"
                maxLength={7}
              />
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer border-0 p-0"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {presetColors.slice(0, 12).map((color) => (
                <button
                  key={color}
                  className={`h-7 w-7 rounded-md border-2 transition-all ${
                    primaryColor === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setPrimaryColor(color)}
                >
                  {primaryColor === color && (
                    <Check className="h-3 w-3 mx-auto text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Alternate Color */}
          <div className="space-y-3">
            <Label className="font-medium">Alternate Color</Label>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-lg border border-border shrink-0"
                style={{ backgroundColor: alternateColor }}
              />
              <Input
                type="text"
                value={alternateColor}
                onChange={(e) => setAlternateColor(e.target.value)}
                className="w-32 font-mono text-sm"
                maxLength={7}
              />
              <input
                type="color"
                value={alternateColor}
                onChange={(e) => setAlternateColor(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer border-0 p-0"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {presetColors.slice(12).map((color) => (
                <button
                  key={color}
                  className={`h-7 w-7 rounded-md border-2 transition-all ${
                    alternateColor === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAlternateColor(color)}
                >
                  {alternateColor === color && (
                    <Check className="h-3 w-3 mx-auto text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: primaryColor }} />
              <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: alternateColor }} />
              <div className="h-10 flex-1 rounded-lg" style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${alternateColor})`
              }} />
            </div>
            <div className="flex gap-2">
              <span
                className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Primary Button
              </span>
              <span
                className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
                style={{ backgroundColor: alternateColor }}
              >
                Alternate Button
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="h-4 w-4 text-primary" />
            Typography
          </CardTitle>
          <CardDescription>
            Choose default fonts for headings and body text on your public site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select value={headingFont} onValueChange={setHeadingFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select value={bodyFont} onValueChange={setBodyFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font preview */}
          <div className="rounded-lg border border-border p-5 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
            <p className="text-2xl font-bold text-foreground">
              {fontOptions.find((f) => f.value === headingFont)?.label || 'Heading'} — League Championship 2025
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {fontOptions.find((f) => f.value === bodyFont)?.label || 'Body'} — The upcoming season kicks off March 30th with 24 teams competing across three divisions. Registration closes this Friday at midnight.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
