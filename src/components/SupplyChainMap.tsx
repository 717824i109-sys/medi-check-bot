import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface SupplyChainStep {
  name: string;
  location: string;
  coordinates: [number, number];
  timestamp: string;
  type: 'manufacturer' | 'distributor' | 'pharmacy';
}

interface SupplyChainMapProps {
  batchNumber: string;
}

const SupplyChainMap: React.FC<SupplyChainMapProps> = ({ batchNumber }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Simulated supply chain data
  const supplyChain: SupplyChainStep[] = [
    {
      name: 'Cipla Pharmaceuticals',
      location: 'Mumbai, India',
      coordinates: [72.8777, 19.0760],
      timestamp: '2024-01-15',
      type: 'manufacturer',
    },
    {
      name: 'MediDist Central',
      location: 'Delhi, India',
      coordinates: [77.2090, 28.6139],
      timestamp: '2024-01-18',
      type: 'distributor',
    },
    {
      name: 'HealthCare Pharmacy',
      location: 'Bangalore, India',
      coordinates: [77.5946, 12.9716],
      timestamp: '2024-01-20',
      type: 'pharmacy',
    },
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    // For demo purposes, use a placeholder token message
    // Users should add their own Mapbox token
    const MAPBOX_TOKEN = 'pk.eyJ1IjoibWVkZ3VhcmQiLCJhIjoiY20zYzBkZjAwMDRxMzJxcHp6ZGZxeGt6eiJ9.demo'; // Placeholder

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [75.8, 18.5],
        zoom: 4,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers for each supply chain step
      supplyChain.forEach((step, index) => {
        const el = document.createElement('div');
        el.className = 'supply-chain-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.color = 'white';
        el.textContent = (index + 1).toString();

        if (step.type === 'manufacturer') {
          el.style.backgroundColor = '#3b82f6';
        } else if (step.type === 'distributor') {
          el.style.backgroundColor = '#8b5cf6';
        } else {
          el.style.backgroundColor = '#10b981';
        }

        new mapboxgl.Marker(el)
          .setLngLat(step.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="padding: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${step.name}</h3>
                <p style="font-size: 12px; color: #666;">${step.location}</p>
                <p style="font-size: 11px; color: #999; margin-top: 4px;">${step.timestamp}</p>
              </div>`
            )
          )
          .addTo(map.current!);
      });

      // Draw lines connecting the supply chain
      map.current.on('load', () => {
        const coordinates = supplyChain.map(step => step.coordinates);
        
        map.current!.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
          },
        });

        map.current!.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#6366f1',
            'line-width': 3,
            'line-dasharray': [2, 2],
          },
        });
      });
    } catch (error) {
      console.error('Mapbox initialization error:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [batchNumber]);

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Supply Chain Tracking</h3>
      <div ref={mapContainer} className="w-full h-96 rounded-lg" />
      
      <div className="mt-6 space-y-3">
        {supplyChain.map((step, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              step.type === 'manufacturer' ? 'bg-blue-500' :
              step.type === 'distributor' ? 'bg-purple-500' : 'bg-green-500'
            }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{step.name}</p>
              <p className="text-sm text-muted-foreground">{step.location}</p>
              <p className="text-xs text-muted-foreground mt-1">{step.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
        <p>
          <strong>Note:</strong> To enable live map visualization, add your Mapbox token to Supabase secrets.
          Visit <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a> to get your free token.
        </p>
      </div>
    </Card>
  );
};

export default SupplyChainMap;
