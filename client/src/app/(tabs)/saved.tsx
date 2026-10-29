import { Page } from '@/components/layout/page';
import { EmptyState } from '@/components/ui/state-view';
import { useI18n } from '@/i18n';

/** Saved routes. Sign-in and the saved list arrive with accounts. */
export default function SavedScreen() {
  const { t } = useI18n();

  return (
    <Page edgeTop>
      <EmptyState icon="bookmark-outline" title={t.saved.emptyTitle} body={t.saved.emptyBody} />
    </Page>
  );
}
