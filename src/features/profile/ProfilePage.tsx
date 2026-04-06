import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useUserProfileQuery } from '@/hooks/useUserProfileQuery';
import { useAuthStore } from '@/store/auth.store';
import { AvatarSelectionModal } from './components/AvatarSelectionModal';
import { ProfileAvatar } from './components/ProfileAvatar';
import { ProfileForm } from './components/ProfileForm';
import { ProfileInfoCards } from './components/ProfileInfoCards';

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const role = useAuthStore((state) => state.role);
    const updateUser = useAuthStore((state) => state.updateUser);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image || null);

    const { data: profileResponse } = useUserProfileQuery();

    // Sync global store with fresh profile data
    useEffect(() => {
        if (profileResponse?.success && profileResponse.data) {
            updateUser(profileResponse.data);
            if (profileResponse.data.image) {
                setAvatarPreview(profileResponse.data.image);
            }
        }
    }, [profileResponse, updateUser]);

    const handleAvatarConfirm = (url: string, updatedUser: any) => {
        setAvatarPreview(url);
        // Update local store for immediate UI feedback
        updateUser({
            ...user,
            ...updatedUser,
            image: url,
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Page Header */}
            <div className="px-1">
                <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Mi Perfil</h1>
                <p className="text-muted-foreground text-xs mt-1">
                    Administra tu información personal y cómo otros usuarios te ven en la plataforma.
                </p>
            </div>

            <Card className="border-border shadow-sm overflow-hidden rounded-2xl">
                <div className="p-8 space-y-8">
                    {/* Section Header */}
                    <div className="border-b border-border pb-4">
                        <h2 className="text-base font-bold text-foreground uppercase tracking-tight">Información Personal</h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Avatar Section */}
                        <ProfileAvatar 
                            avatarPreview={avatarPreview} 
                            onAvatarClick={() => setIsAvatarModalOpen(true)} 
                        />

                        {/* Form Section */}
                        <ProfileForm 
                            user={user} 
                            profileData={profileResponse?.data} 
                            avatarPreview={avatarPreview} 
                        />
                    </div>
                </div>
            </Card>

            {/* Bottom Cards: Role & Connection */}
            <ProfileInfoCards user={profileResponse?.data || user} role={role} />

            <AvatarSelectionModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onConfirm={handleAvatarConfirm}
                initialName={user?.person?.firstName || user?.name || ''}
            />
        </div>
    );
}
