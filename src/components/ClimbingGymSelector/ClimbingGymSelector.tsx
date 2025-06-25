import React, { useState, useEffect } from 'react';
import { ClimbingGymService, ClimbingGym } from '../../services/api/climbingGymService';
import { showError } from '../../utils/notifications';
import { ApiErrorClass } from '../../utils/api';

interface ClimbingGymSelectorProps {
  selectedGymId?: number;
  onGymSelect: (gym: ClimbingGym) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export const ClimbingGymSelector: React.FC<ClimbingGymSelectorProps> = ({
  selectedGymId,
  onGymSelect,
  className = '',
  placeholder = '选择岩馆',
  required = false,
}) => {
  const [gyms, setGyms] = useState<ClimbingGym[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [filteredGyms, setFilteredGyms] = useState<ClimbingGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load gyms and cities on component mount
  useEffect(() => {
    const loadGyms = async () => {
      try {
        setLoading(true);
        const [allGyms, citiesList] = await Promise.all([
          ClimbingGymService.getAll(),
          ClimbingGymService.getCities(),
        ]);
        
        setGyms(allGyms);
        setCities(citiesList);
        setFilteredGyms(allGyms);
      } catch (error) {
        console.error('Failed to load climbing gyms:', error);
        if (error instanceof ApiErrorClass) {
          showError(`加载岩馆列表失败: ${error.message}`);
        } else {
          showError('加载岩馆列表失败');
        }
      } finally {
        setLoading(false);
      }
    };

    loadGyms();
  }, []);

  // Filter gyms based on selected city and search query
  useEffect(() => {
    let filtered = gyms;

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(gym => gym.city === selectedCity);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        gym =>
          gym.name.toLowerCase().includes(query) ||
          gym.address.toLowerCase().includes(query)
      );
    }

    setFilteredGyms(filtered);
  }, [gyms, selectedCity, searchQuery]);

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleGymSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const gymId = parseInt(event.target.value);
    if (gymId) {
      const selectedGym = gyms.find(gym => gym.id === gymId);
      if (selectedGym) {
        onGymSelect(selectedGym);
      }
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* City Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          城市
        </label>
        <select
          value={selectedCity}
          onChange={handleCityChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">全部城市</option>
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          搜索岩馆
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="输入岩馆名称或地址..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Gym Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          选择岩馆 {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedGymId || ''}
          onChange={handleGymSelect}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">{placeholder}</option>
          {filteredGyms.map(gym => (
            <option key={gym.id} value={gym.id}>
              {gym.name} - {gym.address}
            </option>
          ))}
        </select>
      </div>

      {/* Gym Details (if selected) */}
      {selectedGymId && (
        <div className="p-3 bg-gray-50 rounded-lg">
          {(() => {
            const selectedGym = gyms.find(gym => gym.id === selectedGymId);
            if (!selectedGym) return null;

            return (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">{selectedGym.name}</h4>
                <p className="text-sm text-gray-600">{selectedGym.address}</p>
                {selectedGym.phone && (
                  <p className="text-sm text-gray-600">
                    📞 {selectedGym.phone}
                  </p>
                )}
                {selectedGym.openingHours && (
                  <p className="text-sm text-gray-600">
                    🕒 {selectedGym.openingHours}
                  </p>
                )}
                {selectedGym.facilities && selectedGym.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedGym.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* No results message */}
      {filteredGyms.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          没有找到符合条件的岩馆
        </div>
      )}
    </div>
  );
};

export default ClimbingGymSelector; 