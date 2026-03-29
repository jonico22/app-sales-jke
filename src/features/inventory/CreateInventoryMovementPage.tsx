import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchOfficeService, type BranchOffice } from '@/services/branch-office.service';
import { branchOfficeProductService } from '@/services/branch-office-product.service';
import { branchMovementService } from '@/services/branch-movement.service';
import { type Product } from '@/services/product.service';
import { toast } from 'sonner';
import { CreateMovementHeader } from './components/CreateMovementHeader';
import { CreateMovementStep1 } from './components/CreateMovementStep1';
import { CreateMovementStep2 } from './components/CreateMovementStep2';

export default function CreateInventoryMovementPage() {
    const navigate = useNavigate();
    const [branches, setBranches] = useState<BranchOffice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [createdMovementId, setCreatedMovementId] = useState<string | null>(null);

    // Form State
    const [originBranchId, setOriginBranchId] = useState<string>('');
    const [destinationBranchId, setDestinationBranchId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [isReserved, setIsReserved] = useState(true);
    const [referenceCode, setReferenceCode] = useState(`IND-MOVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 2 && originBranchId) {
                searchProducts();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, originBranchId]);

    const fetchBranches = async () => {
        try {
            const response = await branchOfficeService.getAll({ limit: 100, isActive: true });
            if (response.success) {
                setBranches(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            toast.error('Error al cargar sucursales');
        }
    };

    const searchProducts = async () => {
        if (!originBranchId) return;
        try {
            setIsSearching(true);
            const response = await branchOfficeProductService.getForSelect({
                branchOfficeId: originBranchId,
                search: searchTerm,
                limit: 5
            });
            if (response.success) {
                setSearchResults(response.data.data);
            }
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setSearchTerm('');
        setSearchResults([]);
        if (product.stock < quantity) {
            setQuantity(product.stock > 0 ? 1 : 0);
        }
    };

    const handleOriginBranchChange = (id: string) => {
        setOriginBranchId(id);
        setSelectedProduct(null);
    };

    const handleSubmit = async () => {
        if (!originBranchId || !destinationBranchId || !selectedProduct || quantity <= 0) {
            toast.error('Por favor complete todos los campos requeridos');
            return;
        }

        if (originBranchId === destinationBranchId) {
            toast.error('La sucursal de origen y destino no pueden ser la misma');
            return;
        }

        if (quantity > selectedProduct.stock) {
            toast.error('La cantidad no puede superar el stock disponible');
            return;
        }

        try {
            setIsLoading(true);
            const response = await branchMovementService.create({
                originBranchId,
                destinationBranchId,
                productId: selectedProduct.id,
                quantityMoved: quantity,
                referenceCode,
                notes
            });

            if (response.success) {
                toast.success('Movimiento registrado exitosamente');
                setCreatedMovementId(response.data.id);
                setCurrentStep(2);
            }
        } catch (error) {
            console.error('Error creating movement:', error);
            toast.error('Error al crear el movimiento');
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!createdMovementId) return;

        try {
            setIsLoading(true);
            const response = await branchMovementService.updateStatus(createdMovementId, {
                status: 'COMPLETED'
            });

            if (response.success) {
                toast.success('Traslado completado exitosamente');
                navigate('/inventory/movements');
            }
        } catch (error) {
            console.error('Error completing movement:', error);
            toast.error('Error al completar el traslado');
        } finally {
            setIsLoading(false);
        }
    };

    const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Seleccionar sucursal';
    const getBranchAddress = (id: string) => branches.find(b => b.id === id)?.address || 'Dirección no disponible';

    const isStep1Valid = originBranchId && destinationBranchId && selectedProduct && quantity > 0 && originBranchId !== destinationBranchId;

    return (
        <div className="min-h-screen bg-background space-y-4 md:p-2">
            <CreateMovementHeader
                currentStep={currentStep}
                onBack={() => navigate('/inventory/movements')}
            />

            <main className="max-w-4xl mx-auto space-y-4">
                {currentStep === 1 ? (
                    <CreateMovementStep1
                        branches={branches}
                        originBranchId={originBranchId}
                        onOriginBranchChange={handleOriginBranchChange}
                        destinationBranchId={destinationBranchId}
                        onDestinationBranchChange={setDestinationBranchId}
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        searchResults={searchResults}
                        isSearching={isSearching}
                        selectedProduct={selectedProduct}
                        onSelectProduct={handleSelectProduct}
                        quantity={quantity}
                        onQuantityChange={setQuantity}
                        isReserved={isReserved}
                        onIsReservedChange={setIsReserved}
                        referenceCode={referenceCode}
                        onReferenceCodeChange={setReferenceCode}
                        notes={notes}
                        onNotesChange={setNotes}
                        isLoading={isLoading}
                        isStep1Valid={!!isStep1Valid}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/inventory/movements')}
                        getBranchName={getBranchName}
                    />
                ) : (
                    <CreateMovementStep2
                        referenceCode={referenceCode}
                        originBranchId={originBranchId}
                        destinationBranchId={destinationBranchId}
                        selectedProduct={selectedProduct}
                        quantity={quantity}
                        isLoading={isLoading}
                        onComplete={handleComplete}
                        getBranchName={getBranchName}
                        getBranchAddress={getBranchAddress}
                    />
                )}
            </main>
        </div>
    );
}
