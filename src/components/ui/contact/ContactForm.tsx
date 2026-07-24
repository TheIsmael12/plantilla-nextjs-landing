'use client';

import { useTranslations } from 'next-intl';
import { useFormik } from 'formik';
import { CheckCircle, SendIcon } from 'lucide-react';
import Link from 'next/link';

import Input from '@/components/ui/inputs/Input';
import Textarea from '@/components/ui/inputs/Textarea';
import Button from '@/components/ui/buttons/Button';

import { contactSchema } from '@/schemas/contact.schema';
import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactForm.scss';

const INITIAL: ContactFormValues = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

/**
 * Formulario de contacto del sistema de diseño: valida con Formik + Yup
 * (`contactSchema`), traduce toda la copia mediante `Contact.form`, y
 * alterna entre estado de envío (`loading`), error a nivel de formulario
 * (`error`) y confirmación de éxito (`success`).
 * @param {ContactFormProps} props - Propiedades del formulario
 * @returns {JSX.Element} El formulario de contacto renderizado
 */
export default function ContactForm({
    onSubmit,
    loading = false,
    success = false,
    error,
}: ContactFormProps) {

    const t = useTranslations('Contact.form');

    const formik = useFormik<ContactFormValues>({
        initialValues: INITIAL,
        validationSchema: contactSchema(),
        onSubmit: (values) => onSubmit?.(values),
    });

    if (success) {
        return (
            <div className="contact__form contact__form--success">
                <div className="contact__form-success">
                    <CheckCircle aria-hidden="true" />
                    <p>{t('success')}</p>
                </div>
            </div>
        );
    }

    return (

        <form className="contact__form" onSubmit={formik.handleSubmit} noValidate>

            <div className="contact__form-header">
                <h2 className="contact__title-lg">{t('title')}</h2>
                <p className="contact__text-muted">{t('subtitle')}</p>
            </div>

            {error && <p className="contact__form-global-error">{error}</p>}

            <div className="contact__form-grid">

                <Input
                    id="cf-name"
                    name="name"
                    label={t('fields.name')}
                    type="text"
                    placeholder={t('placeholders.name')}
                    noTranslate
                    required
                    autoComplete="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.name}
                    touched={formik.touched.name}
                    className="input__full"
                />

                <Input
                    id="cf-email"
                    name="email"
                    label={t('fields.email')}
                    type="text"
                    placeholder={t('placeholders.email')}
                    noTranslate
                    required
                    autoComplete="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.email}
                    touched={formik.touched.email}
                    className="input__full"
                />

                <div className="contact__form-full">
                    <Input
                        id="cf-subject"
                        name="subject"
                        label={t('fields.subject')}
                        type="text"
                        placeholder={t('placeholders.subject')}
                        noTranslate
                        required
                        value={formik.values.subject}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.subject}
                        touched={formik.touched.subject}
                        className="input__full"
                    />
                </div>

                <div className="contact__form-full">
                    <Textarea
                        id="cf-message"
                        name="message"
                        label={t('fields.message')}
                        placeholder={t('placeholders.message')}
                        noTranslate
                        required
                        rows={5}
                        value={formik.values.message}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.message}
                        touched={formik.touched.message}
                    />
                </div>

            </div>

            <div className="contact__form-footer">
                <p className="contact__form-privacy">
                    {t('privacy')}{' '}
                    <Link href="/privacy-policy">{t('privacyLink')}</Link>
                </p>
                <Button
                    title={loading ? 'submitting' : 'submit'}
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={loading || formik.isSubmitting}
                >
                    <SendIcon aria-hidden="true" />
                </Button>
            </div>

        </form>

    )

}
