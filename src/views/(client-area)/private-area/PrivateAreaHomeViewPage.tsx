import { getTranslations } from 'next-intl/server';
import { BriefcaseIcon, FileTextIcon, ReceiptIcon, UserIcon, ArrowRightIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import '@/styles/04-components/client-area/private-area-home.scss';

interface PrivateAreaHomeCard {
    href: '/private-area/profile' | '/private-area/services' | '/private-area/quotes' | '/private-area/invoices';
    icon: typeof UserIcon;
    title: string;
    description: string;
}

/**
 * Home de `/private-area`: tarjetas de acceso a perfil, servicios,
 * presupuestos y facturas. Server Component (sin interactividad propia).
 * @returns {Promise<JSX.Element>} La página de inicio del área privada renderizada
 */
export default async function PrivateAreaHomeViewPage() {
    const t = await getTranslations('Views.ClientArea.Home');
    const tRoutes = await getTranslations('Navigation.Routes');

    const cards: PrivateAreaHomeCard[] = [
        {
            href: '/private-area/profile',
            icon: UserIcon,
            title: tRoutes('/private-area/profile'),
            description: t('profileDescription'),
        },
        {
            href: '/private-area/services',
            icon: BriefcaseIcon,
            title: tRoutes('/private-area/services'),
            description: t('servicesDescription'),
        },
        {
            href: '/private-area/quotes',
            icon: FileTextIcon,
            title: tRoutes('/private-area/quotes'),
            description: t('quotesDescription'),
        },
        {
            href: '/private-area/invoices',
            icon: ReceiptIcon,
            title: tRoutes('/private-area/invoices'),
            description: t('invoicesDescription'),
        },
    ];

    return (
        <div className="private-area-home">
            <h1 className="private-area-home__title">{t('title')}</h1>
            <p className="private-area-home__description">{t('description')}</p>

            <div className="private-area-home__grid">
                {cards.map(({ href, icon: Icon, title, description }) => (
                    <Link key={href} href={href} className="private-area-home__card">
                        <span className="private-area-home__card-icon">
                            <Icon aria-hidden="true" />
                        </span>
                        <span className="private-area-home__card-body">
                            <span className="private-area-home__card-title">{title}</span>
                            <span className="private-area-home__card-description">{description}</span>
                        </span>
                        <ArrowRightIcon className="private-area-home__card-arrow" aria-hidden="true" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
