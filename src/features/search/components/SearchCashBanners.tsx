import { CashOpeningBanner } from '../../pos/components/CashOpeningBanner';
import { CashClosingBanner } from '../../pos/components/CashClosingBanner';
import { useNavigate } from 'react-router-dom';

interface SearchCashBannersProps {
    isShiftLoading: boolean;
    isShiftOpen: boolean;
    refreshShift: () => void;
    branchName?: string;
    currentShiftId?: string;
}

export function SearchCashBanners({
    isShiftLoading,
    isShiftOpen,
    refreshShift,
    branchName,
    currentShiftId
}: SearchCashBannersProps) {
    const navigate = useNavigate();

    return (
        <div className="px-4 md:px-6 pt-3 md:pt-4">
            {isShiftLoading ? (
                <CashOpeningBanner isLoading={true} />
            ) : !isShiftOpen ? (
                <CashOpeningBanner refreshShift={refreshShift} />
            ) : (
                <CashClosingBanner
                    branchName={branchName}
                    onCloseCash={() => navigate(`/pos/cash-closing/${currentShiftId}`)}
                />
            )}
        </div>
    );
}
