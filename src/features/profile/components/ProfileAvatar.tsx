import { User as UserIcon, Camera } from 'lucide-react';

interface ProfileAvatarProps {
    avatarPreview: string | null;
    onAvatarClick: () => void;
}

export function ProfileAvatar({ avatarPreview, onAvatarClick }: ProfileAvatarProps) {
    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative group cursor-pointer" onClick={onAvatarClick}>
                <div className="h-40 w-40 rounded-full bg-primary/10 border-4 border-background shadow-md flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <UserIcon className="h-20 w-20 text-orange-300" />
                    )}
                </div>
                <div className="absolute bottom-2 right-2 bg-primary p-2.5 rounded-full border-4 border-background text-primary-foreground shadow-lg group-hover:bg-primary/90 transition-colors">
                    <Camera className="h-5 w-5" />
                </div>
            </div>
            <button
                type="button"
                onClick={onAvatarClick}
                className="text-sky-500 font-bold text-sm hover:text-sky-600 transition-colors"
            >
                Cambiar foto
            </button>
        </div>
    );
}
