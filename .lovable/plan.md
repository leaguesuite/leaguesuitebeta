

## Client Onboarding Portal

### Overview
Build a new "Client Onboarding" section under Features in the sidebar that lets you create onboarding packages for new clients. Each package contains three documents: a Pre-Deployment Form (questionnaire), a Master Service Agreement (e-sign), and an Order Sheet (e-sign). You can generate a package per client, track status, and collect e-signatures.

### What gets built

**1. Database tables (3 new tables)**
- `onboarding_packages` -- one row per client onboarding (client name, email, status, created_at, org_id)
- `onboarding_documents` -- one row per document in a package (package_id, doc_type enum [pre_deployment_form, service_agreement, order_sheet], status [draft, sent, viewed, signed], signature_data jsonb, signed_at, custom_fields jsonb)
- `onboarding_form_responses` -- stores answers to the pre-deployment questionnaire (document_id, responses jsonb, submitted_at)

**2. Pages & Components**

- **Onboarding Dashboard** (`/onboarding`) -- lists all client packages with status indicators (draft, sent, partially signed, complete). "New Package" button opens a creation dialog.
- **New Package Dialog** -- enter client name, email, company; auto-generates the three documents. Pre-fill order sheet fields (pricing, dates). Preview before sending.
- **Package Detail Page** (`/onboarding/:id`) -- shows the three documents as cards with individual status. Actions: edit, send/resend, view responses, download signed copies.
- **Pre-Deployment Form Builder** -- a configured questionnaire (league name, expected teams, divisions, scoring preferences, etc.) rendered as a form. Stored as JSON config so questions can evolve.
- **E-Signature Component** -- canvas-based signature pad for the MSA and Order Sheet. Captures signature as base64 image, stores timestamp and IP. Uses a simple draw-on-canvas approach (no third-party e-sign service needed initially).
- **Public Signing Pages** (`/sign/:token`) -- unauthenticated routes where clients can view documents, fill the questionnaire, and sign. Token-based access via a unique link per package.

**3. Sidebar addition**
- Add "Client Onboarding" under Features with a `ClipboardList` or `ScrollText` icon, linking to `/onboarding`.

**4. Routes**
- `/onboarding` -- dashboard (admin, inside AppLayout)
- `/onboarding/:id` -- package detail (admin)
- `/sign/:token` -- public signing page (outside AppLayout, no auth required)

### Technical details

- **Signature pad**: Use an HTML canvas element for drawing signatures. Store as base64 PNG in `signature_data` jsonb column. No external library needed.
- **Token-based public access**: Generate a UUID token per package stored in `onboarding_packages.access_token`. The `/sign/:token` route fetches package data via the token with anon RLS policy.
- **Document templates**: MSA content stored as a rich text template in the codebase (can later move to DB). Order sheet is a form with editable pricing/date fields.
- **RLS**: Admin org members can CRUD packages/documents. Anon users can SELECT and UPDATE documents matched by access_token only.
- **Email sending**: For now, display a "copy link" button for the signing URL. Email integration can be added later.

### Files to create/modify
- Migration: 3 new tables + RLS policies
- `src/pages/onboarding/OnboardingDashboard.tsx`
- `src/pages/onboarding/OnboardingPackageDetail.tsx`
- `src/pages/onboarding/PublicSigningPage.tsx`
- `src/components/onboarding/NewPackageDialog.tsx`
- `src/components/onboarding/SignaturePad.tsx`
- `src/components/onboarding/PreDeploymentForm.tsx`
- `src/components/onboarding/DocumentCard.tsx`
- Update `AppSidebar.tsx` -- add nav item
- Update `App.tsx` -- add routes

