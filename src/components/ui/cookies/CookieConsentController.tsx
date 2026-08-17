'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { CookieIcon, ChevronDown, Settings2, X, Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';

import { useFocusTrap } from '@/hooks/useFocusTrap';
import Button from '@/components/ui/buttons/Button';
import Badge from '@/components/ui/buttons/Badge';
import Toggle from '@/components/ui/inputs/Toggle';
import {
    DENIED_CONSENT,
    OPEN_COOKIE_CONSENT_EVENT,
    readCookieConsent,
    writeCookieConsent,
    type CookieConsentCategories,
    type CookieConsentData,
} from '@/lib/cookieConsent';
import '@/styles/04-components/cookies/cookieConsent.scss';

// Types -------------------------------------------------------------

/** Se reexporta desde su nuevo sitio (`lib/cookieConsent.ts`) para no romper a quien lo importara de aquí. */
export type { CookieConsentData };

type Draft = CookieConsentCategories;

const DEFAULT_DRAFT: Draft = DENIED_CONSENT;

// Controller --------------------------------------------------------

/**
 * Banner de consentimiento de cookies: se muestra si no hay preferencias
 * guardadas, permite aceptar o rechazar todo, o ajustar cada categoría por
 * separado, y persiste la elección con `lib/cookieConsent.ts`, que además
 * avisa a quien dependa de ella (la medición de `GoogleTagManager`).
 * También escucha el evento `na:open-cookie-consent` para poder reabrirse
 * desde otras partes de la app (p. ej. un enlace del footer).
 * @returns {JSX.Element | null} El banner de cookies renderizado, o `null` mientras está oculto
 */
export default function CookieConsentController() {
    const t = useTranslations('CookieConsent');
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
    const [saving, setSaving] = useState(false);

    const panelRef = useRef<HTMLDivElement>(null);

    // Show banner if no consent stored yet
    useEffect(() => {
        const stored = readCookieConsent();
        if (!stored) {
            const timer = setTimeout(() => setVisible(true), 700);
            return () => clearTimeout(timer);
        }
    }, []);

    // Allow external code to re-open the panel (e.g. from footer link)
    useEffect(() => {
        const handler = () => {
            const stored = readCookieConsent();
            setDraft(stored
                ? { analytics: stored.analytics, marketing: stored.marketing, functional: stored.functional }
                : DEFAULT_DRAFT,
            );
            setSaving(false);
            setExpanded(true);
            setVisible(true);
        };
        window.addEventListener(OPEN_COOKIE_CONSENT_EVENT, handler);
        return () => window.removeEventListener(OPEN_COOKIE_CONSENT_EVENT, handler);
    }, []);

    const persist = useCallback((data: CookieConsentData) => {
        writeCookieConsent(data);
        setSaving(true);
        setTimeout(() => setVisible(false), 950);
    }, []);

    const acceptAll = useCallback(() => {
        persist({ analytics: true, marketing: true, functional: true, timestamp: Date.now() });
    }, [persist]);

    const rejectAll = useCallback(() => {
        persist({ analytics: false, marketing: false, functional: false, timestamp: Date.now() });
    }, [persist]);

    const saveSelection = useCallback(() => {
        persist({ ...draft, timestamp: Date.now() });
    }, [draft, persist]);

    const handleToggle = useCallback(
        (key: keyof Draft) => (checked: boolean) => {
            setDraft(prev => ({ ...prev, [key]: checked }));
        },
        [],
    );

    // Focus trap: keeps keyboard focus inside the panel while it is open.
    // Escape triggers rejectAll (minimal-consent close), matching the X button behaviour.
    useFocusTrap({
        isActive: visible && !saving,
        ref: panelRef,
        onEscape: rejectAll,
    });

    if (!visible) return null;

    return (
        <div
            ref={panelRef}
            className={`cookie-consent${saving ? ' cookie-consent--hiding' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
        >
            {/* Header */}
            <div className="cookie-consent__header">
                <div className="cookie-consent__header__brand">
                    <div className="cookie-consent__icon" aria-hidden="true">
                        <CookieIcon size={18} strokeWidth={1.75} />
                    </div>
                    <div>
                        <p className="cookie-consent__title">{t('title')}</p>
                        <p className="cookie-consent__powered">{t('powered')}</p>
                    </div>
                </div>
                <button
                    className="cookie-consent__close"
                    onClick={rejectAll}
                    aria-label={t('closeAriaLabel')}
                    type="button"
                >
                    <X size={14} aria-hidden="true" />
                </button>
            </div>

            {/* Body */}
            <div className="cookie-consent__body">
                <p className="cookie-consent__desc">
                    {t('desc')}{' '}
                    <Link href="/cookies-policy" className="cookie-consent__link">
                        {t('policyLink')}
                    </Link>
                </p>

                {/* Expandable preferences toggle */}
                <button
                    type="button"
                    className={`cookie-consent__toggle${expanded ? ' cookie-consent__toggle--open' : ''}`}
                    onClick={() => setExpanded(e => !e)}
                    aria-expanded={expanded}
                >
                    <Settings2 size={13} aria-hidden="true" />
                    {t('configure')}
                    <ChevronDown size={13} aria-hidden="true" className="cookie-consent__toggle__chevron" />
                </button>

                {expanded && (
                    <div className="cookie-consent__prefs" role="group" aria-label={t('configure')}>

                        {/* Necessary - always on, locked */}
                        <div className="cookie-consent__pref cookie-consent__pref--locked">
                            <div className="cookie-consent__pref__info">
                                <div>
                                    <span className="cookie-consent__pref__name">
                                        {t('necessary')}
                                        <Badge status="success" value={t('alwaysOn')} />
                                    </span>
                                    <p className="cookie-consent__pref__desc">{t('necessaryDesc')}</p>
                                </div>
                            </div>
                            <Toggle
                                id="cc-necessary"
                                name="necessary"
                                label=""
                                ariaLabel={t('necessary')}
                                checked
                                disabled
                                onChange={() => { /* locked */ }}
                            />
                        </div>

                        {/* Functional */}
                        <div className="cookie-consent__pref">
                            <div className="cookie-consent__pref__info">
                                <div>
                                    <span className="cookie-consent__pref__name">
                                        {t('functional')}
                                        <Badge status="pending" value={t('optional')} />
                                    </span>
                                    <p className="cookie-consent__pref__desc">{t('functionalDesc')}</p>
                                </div>
                            </div>
                            <Toggle
                                id="cc-functional"
                                name="functional"
                                label=""
                                ariaLabel={t('functional')}
                                checked={draft.functional}
                                onChange={handleToggle('functional')}
                            />
                        </div>

                        {/* Analytics */}
                        <div className="cookie-consent__pref">
                            <div className="cookie-consent__pref__info">
                                <div>
                                    <span className="cookie-consent__pref__name">
                                        {t('analytics')}
                                        <Badge status="pending" value={t('optional')} />
                                    </span>
                                    <p className="cookie-consent__pref__desc">{t('analyticsDesc')}</p>
                                </div>
                            </div>
                            <Toggle
                                id="cc-analytics"
                                name="analytics"
                                label=""
                                ariaLabel={t('analytics')}
                                checked={draft.analytics}
                                onChange={handleToggle('analytics')}
                            />
                        </div>

                        {/* Marketing */}
                        <div className="cookie-consent__pref">
                            <div className="cookie-consent__pref__info">
                                <div>
                                    <span className="cookie-consent__pref__name">
                                        {t('marketing')}
                                        <Badge status="pending" value={t('optional')} />
                                    </span>
                                    <p className="cookie-consent__pref__desc">{t('marketingDesc')}</p>
                                </div>
                            </div>
                            <Toggle
                                id="cc-marketing"
                                name="marketing"
                                label=""
                                ariaLabel={t('marketing')}
                                checked={draft.marketing}
                                onChange={handleToggle('marketing')}
                            />
                        </div>

                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="cookie-consent__actions">
                <Button variant="secondary" size="sm" onClick={rejectAll}>{t('rejectAll')}</Button>
                {expanded && (
                    <Button variant="outline" size="sm" onClick={saveSelection}>{t('saveSelection')}</Button>
                )}
                <Button variant="primary" size="sm" onClick={acceptAll}>{t('acceptAll')}</Button>
            </div>

            {/* Saved feedback */}
            {saving && (
                <div className="cookie-consent__saved" aria-live="polite">
                    <Check size={13} aria-hidden="true" />
                    {t('saved')}
                </div>
            )}
        </div>
    );
}
