import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type Pharmacy = {
  name: string;
  distance: string;
  price: string;
  available: boolean;
  rating: number;
  address: string;
  phone: string;
};

export function PharmacyLocator({ medicineName }: { medicineName: string }) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);

  const findNearbyPharmacies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pharmacy-api', {
        body: { medicineName }
      });

      if (error) throw error;
      setPharmacies(data.pharmacies);
    } catch (error) {
      console.error('Error finding pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Find Nearby Pharmacies</h3>
      <Button onClick={findNearbyPharmacies} disabled={loading} className="mb-4">
        {loading ? "Searching..." : "Find Pharmacies"}
      </Button>

      <div className="space-y-3">
        {pharmacies.map((pharmacy, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{pharmacy.name}</h4>
              {pharmacy.available ? (
                <Badge className="bg-success">In Stock</Badge>
              ) : (
                <Badge variant="secondary">Out of Stock</Badge>
              )}
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {pharmacy.address} • {pharmacy.distance}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {pharmacy.phone}
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {pharmacy.rating} / 5.0
              </div>
            </div>
            <div className="mt-2 font-bold text-primary">{pharmacy.price}</div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
