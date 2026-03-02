import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string
    }>;
    prompt(): Promise<void>;
}

interface PWAInstallButtonProps {
    showText?: boolean;
}

export function PWAInstallButton({ showText = true }: PWAInstallButtonProps) {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if the app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setSupportsPWA(false);
            setPromptInstall(null);
        });

        return () => window.removeEventListener('transitionend', handler);
    }, []);

    const onClick = async () => {
        if (!promptInstall) return;
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setSupportsPWA(false);
        }
    };

    if (!supportsPWA || isInstalled) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size={showText ? "default" : "icon"}
            onClick={onClick}
            className={showText ? "gap-2 border-primary/50 hover:border-primary" : "border-primary/50 hover:border-primary"}
            title="Install ShopSense App"
        >
            <Download className="h-4 w-4" />
            {showText && <span>Install App</span>}
        </Button>
    );
}
