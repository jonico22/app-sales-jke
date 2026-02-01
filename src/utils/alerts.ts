import Swal, { type SweetAlertIcon } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const COLORS = {
    primary: '#00BFFF',
    secondary: '#334155',
    destructive: '#ef4444',
    success: '#22c55e',
    background: '#FFFFFF',
    text: '#334155'
};

interface AlertOptions {
    title: string;
    text?: string;
    icon?: SweetAlertIcon;
    confirmButtonText?: string;
}

interface ConfirmOptions extends AlertOptions {
    cancelButtonText?: string;
    confirmButtonColor?: string;
}

export const alerts = {
    /**
     * Show a standard alert (success, error, info, etc.)
     */
    show: ({ title, text, icon = 'info', confirmButtonText = 'OK' }: AlertOptions) => {
        return MySwal.fire({
            title,
            text,
            icon,
            confirmButtonText,
            confirmButtonColor: COLORS.primary,
            background: COLORS.background,
            color: COLORS.text,
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-xl px-6 py-2 font-bold shadow-lg shadow-sky-500/20',
            },
            buttonsStyling: true
        });
    },

    /**
     * Show a confirmation dialog (e.g. for deleting items)
     */
    confirm: async ({
        title,
        text,
        icon = 'warning',
        confirmButtonText = 'Sí, continuar',
        cancelButtonText = 'Cancelar',
        confirmButtonColor = COLORS.primary
    }: ConfirmOptions): Promise<boolean> => {
        const result = await MySwal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
            confirmButtonColor,
            cancelButtonColor: COLORS.secondary,
            background: COLORS.background,
            color: COLORS.text,
            reverseButtons: true, // Typical for modern web apps (Cancel left, Action right)
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-xl px-6 py-2 font-bold shadow-md mx-2',
                cancelButton: 'rounded-xl px-6 py-2 font-medium bg-white text-slate-500 hover:bg-slate-50 mx-2 shadow-sm border border-slate-200'
            },
            buttonsStyling: true
        });

        return result.isConfirmed;
    }
};
