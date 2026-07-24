/**
 * ContactMapSectionProps defines the properties for the ContactMapSection component,
 * which renders a map alongside a summary of contact details.
 *
 * @interface ContactMapSectionProps
 * @property {string} [address]  - Street address to display and optionally pin on the map.
 * @property {string} [city]     - City or locality name shown below the street address.
 * @property {string} [phone]         - Phone number displayed as a `tel:` link.
 * @property {string} [email]         - Email address displayed as a `mailto:` link.
 * @property {string} [schedule]      - Opening hours or availability text (e.g. "Mon–Fri, 9:00–18:00").
 * @property {string} [emergencyPhone] - 24h emergency phone number displayed as a `tel:` link.
 */
interface ContactMapSectionProps {
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  schedule?: string;
  emergencyPhone?: string;
}
