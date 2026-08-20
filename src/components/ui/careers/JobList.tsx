import JobCard from '@/components/ui/careers/JobCard';

import '@/styles/04-components/careers/careersBase.scss';

/**
 * Cuadrícula de ofertas.
 *
 * No reordena nada: las destacadas ya vienen primero desde la API, dentro de la ordenación pedida. Ordenar
 * aquí otra vez sería una segunda fuente de verdad sobre qué se ve antes.
 * @param {JobListProps} props - Propiedades del componente
 * @returns {JSX.Element} La cuadrícula renderizada
 */
export default function JobList({ jobs }: JobListProps) {
    return (
        <div className="careers__grid">
            {jobs.map((job) => (
                <JobCard key={job.jobCode} job={job} />
            ))}
        </div>
    );
}
