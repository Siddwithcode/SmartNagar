import { useNavigate } from 'react-router-dom';
import { ReportModal } from '@/components/issues/ReportModal';

export default function ReportIssue() {
  const navigate = useNavigate();

  return (
    <ReportModal
      open
      onOpenChange={(open) => {
        if (!open) {
          navigate('/');
        }
      }}
      onSuccess={() => navigate('/')}
    />
  );
}
