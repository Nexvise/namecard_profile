# Technical System Specification
## Template-Driven SaaS Digital Namecard Platform

This document outlines the detailed system architecture, database schema, routing logic, and frontend specs for developers to build the Digital Namecard platform.

---

## 1. Technology Stack
*   **Frontend & Routing**: [Next.js (App Router)](https://nextjs.org/) (React, TypeScript).
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL for relational database, Supabase Auth for authentication).
*   **Storage**: [Supabase Storage](https://supabase.com/docs/guides/storage) (for uploading and serving user avatar images).
*   **Styling**: Vanilla CSS with modern custom properties (CSS variables) for dynamic runtime branding.

---

## 2. Database Schema Design (PostgreSQL)

### 2.1. `profiles` Table
Stores primary contact details, custom slug, and styling preferences. Maps 1-to-1 with Supabase Auth users.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default `gen_random_uuid()` | Unique identifier for the profile. |
| `user_id` | `UUID` | Foreign Key (`auth.users.id`), Unique, CASCADE | Links the profile to the auth user. |
| `custom_slug` | `VARCHAR(50)`| Unique, Indexed | The custom path chosen by the user (e.g. `johnsmith`). |
| `full_name` | `VARCHAR(100)`| Not Null | First and last name of the user. |
| `title` | `VARCHAR(100)`| | Professional job title. |
| `company_name` | `VARCHAR(100)`| | Current company name. |
| `bio` | `TEXT` | | Short professional bio/description. |
| `avatar_url` | `TEXT` | | Public URL to the profile picture hosted in Supabase Storage. |
| `phone` | `VARCHAR(20)` | | Call quick-action phone number (e.g., `+123456789`). |
| `email` | `VARCHAR(255)`| | Email quick-action address. |
| `whatsapp` | `VARCHAR(20)` | | WhatsApp quick-action phone number. |
| `theme_preset` | `VARCHAR(20)` | Default `'glassmorphism'` | Chosen base theme: `light`, `dark`, or `glassmorphism`. |
| `accent_color` | `VARCHAR(7)` | Default `'#000000'` | Hex code for buttons and highlights (e.g. `#4F46E5`). |
| `background_style`| `TEXT` | Default `'#ffffff'` | Hex code or CSS gradient string for the profile background. |
| `font_family` | `VARCHAR(50)` | Default `'Inter'` | Curated Google Font name (e.g. `Inter`, `Outfit`, `Space Grotesk`). |
| `created_at` | `TIMESTAMPTZ` | Default `now()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | Default `now()` | Record modification timestamp. |

### 2.2. `links` Table
Stores custom external links (e.g., LinkedIn, GitHub, Calendly) for each profile.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default `gen_random_uuid()` | Unique identifier for the link. |
| `profile_id` | `UUID` | Foreign Key (`profiles.id`), CASCADE | Links back to the parent profile. |
| `link_type` | `VARCHAR(30)` | Not Null | E.g. `'linkedin'`, `'github'`, `'twitter'`, `'website'`, `'custom'`. |
| `label` | `VARCHAR(50)` | Not Null | Display text for the link button (e.g. "My Portfolio"). |
| `url` | `TEXT` | Not Null | Target destination URL. |
| `display_order` | `INTEGER` | Default `0` | Order of appearance on the profile screen (ascending). |
| `created_at` | `TIMESTAMPTZ` | Default `now()` | Record creation timestamp. |

---

## 3. Dynamic Routing System (URL Management)

### 3.1. Routing Architecture
*   Profile cards render dynamically at the root slug path: `domain.com/[slug]`.
*   File structure in Next.js: `app/[slug]/page.tsx`.
*   System files (e.g., dashboard, login, API) use static folders under `app/` which take precedence over wildcard parameters (e.g., `app/dashboard/page.tsx`).

### 3.2. Reserved Slugs Validation
To prevent users from hijacking system paths, the dashboard profile builder must reject the following reserved terms:
*   `dashboard`, `login`, `register`, `auth`, `api`, `static`, `admin`, `settings`, `index`, `help`, `privacy`, `terms`, `reset-password`.

---

## 4. Reusable UI Templates (Frontend Engine)

### 4.1. Runtime Styles Injections
Theme configurations are loaded from the database and injected into the root container of the page at runtime:
```jsx
// Example styling wrapper
const profileStyles = {
  '--accent-color': profile.accent_color,
  '--background-style': profile.background_style,
  '--font-family': `'${profile.font_family}', sans-serif`,
};

return (
  <main className={`profile-shell theme-${profile.theme_preset}`} style={profileStyles}>
    {/* Page Content */}
  </main>
);
```

### 4.2. Component-Driven Rendering
Components are rendered conditionally based on whether data exists in the database record:
*   **Quick Actions**: Render the call/email/whatsapp icons *only* if the corresponding column is not null.
*   **Social List**: Map over the rows in the `links` table associated with the profile ID, sorted by `display_order`.

### 4.3. Client-Side vCard Generation
A "Save to Contacts" utility is executed client-side. When clicked, it builds a vCard string dynamically:
```javascript
const makeVCard = (profile) => {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name}
ORG:${profile.company_name || ''}
TITLE:${profile.title || ''}
TEL;TYPE=CELL:${profile.phone || ''}
EMAIL;TYPE=INTERNET:${profile.email || ''}
URL:${window.location.origin}/${profile.custom_slug}
END:VCARD`;

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${profile.full_name.replace(/\s+/g, '_')}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

---

## 5. User Dashboard & NFC Provisioning

### 5.1. Dashboard Features
1.  **Auth & Register**: Handle email/password signups. On success, auto-create a profile record with a randomized slug.
2.  **Profile Builder WYSIWYG Form**:
    *   Fields for: Name, Title, Company, Bio, Phone, Email, WhatsApp.
    *   Avatar Upload: Handles drop/upload to Supabase Storage, returning the public image link.
    *   Design Picker: Color pickers for accent & background, select dropdowns for preset themes and fonts.
    *   Slug Editor: Custom input that runs a real-time availability check in the `profiles` table.
3.  **Links Editor**: A list of links with inline edit/delete fields and a "Add Link" button.
4.  **NFC Provisioning Module**:
    *   Renders the profile URL (e.g. `https://yourdomain.com/johnsmith`).
    *   Provides a copy-to-clipboard button.
    *   Includes a dynamically generated QR code (rendered client-side using `react-qr-code`) with a download button.
