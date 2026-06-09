import { notFound } from 'next/navigation';
import { getProfileBySlug, getLinksByProfileId } from '@/lib/data';
import ProfileCard from '@/components/profile-card';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const links = await getLinksByProfileId(profile.id);

  return <ProfileCard profile={profile} links={links} />;
}
