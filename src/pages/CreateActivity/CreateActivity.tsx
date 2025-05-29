import React, { useState, useEffect, FormEvent } from 'react';
import { useActivityActions, useUserSelector } from '../../store/useOptimizedStore';
import { showSuccess, showError } from '../../utils/notifications';
import dayjs from 'dayjs';
import {
  Activity,
  ActivityFormData,
  MeetMode,
  CostMode,
  User,
  ActivityType,
  ActivityStatus,
  IconProps,
} from '../../types';
import './CreateActivity.css';
import {
  V_SCALE_GRADES,
  YDS_GRADES,
  activityTypeDetails,
} from '../../constants/climbingData';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Icon Placeholders with proper typing
const IconPlaceholder = ({ name, className = "w-5 h-5" }: { name: string, className?: string }) => <span className={`inline-block text-gray-500 ${className}`}>[{name}]</span>;
const CloseCircleOutline = (props: IconProps) => <IconPlaceholder {...props} name="X" />;
const LocationOutline = (props: IconProps) => <IconPlaceholder {...props} name="MapPin" />;
const EnvironmentOutline = (props: IconProps) => <IconPlaceholder {...props} name="Loc" />;
const ClockCircleOutline = (props: IconProps) => <IconPlaceholder {...props} name="Time" />;
const TeamOutline = (props: IconProps) => <IconPlaceholder {...props} name="Users" />;
const TagOutline = (props: IconProps) => <IconPlaceholder {...props} name="Tag" />;
const TextOutline = (props: IconProps) => <IconPlaceholder {...props} name="Txt" />;

// Import Leaflet images directly
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet marker icon issue with webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const VENUES = [
  { label: '岩时攀岩馆（望京店）', value: 'yanhshi_wangjing', lat: 39.9884, lng: 116.4716 },
  { label: '岩时攀岩馆（国贸店）', value: 'yanhshi_guomao', lat: 39.9087, lng: 116.4575 },
  { label: '奥攀攀岩馆', value: 'aopan', lat: 39.9928, lng: 116.3946 },
  { label: '首体攀岩馆', value: 'shouti', lat: 39.9337, lng: 116.3324 },
  { label: '岩舞空间（大悦城店）', value: 'yanwu_dayuecheng', lat: 39.9127, lng: 116.4779 },
];

interface CreateActivityProps {
  onClose: () => void;
}

// initialFormValues now aligns with ActivityFormData fields, excluding date/time strings
const initialFormValues: Omit<ActivityFormData, 'datetime'> & { lat?: number; lng?: number; grades: string[] } = {
  title: '',
  locationText: '',
  description: '',
  types: [],
  grades: [], // Ensure grades is always an array
  slotMax: 2,
  meetMode: MeetMode.MEET_AT_ENTRANCE,
  costMode: CostMode.AA,
  isPrivate: false,
  lat: undefined, // Changed from null
  lng: undefined, // Changed from null
};

const CreateActivity: React.FC<CreateActivityProps> = ({ onClose }) => {
  const { user } = useUserSelector();
  const { addActivity: storeAddActivity } = useActivityActions();
  const [loading, setLoading] = useState(false);
  
  const [formValues, setFormValues] = useState(initialFormValues);
  
  const [currentGradeOptions, setCurrentGradeOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [activityDateString, setActivityDateString] = useState<string>('');
  const [startTimeString, setStartTimeString] = useState<string>('');
  const [endTimeString, setEndTimeString] = useState<string>('');

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([39.9042, 116.4074]); 
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [poiSearchTerm, setPoiSearchTerm] = useState('');
  const [poiResults, setPoiResults] = useState<typeof VENUES>([]);

  // Helper to update form values
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormValues(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'select-multiple') {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
      setFormValues(prev => ({ ...prev, [name]: selectedOptions }));
    } else if (name === 'slotMax') {
      setFormValues(prev => ({ ...prev, [name]: parseInt(value, 10) || 1 }));
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const setSpecificFormValue = (name: keyof typeof initialFormValues, value: string | number | boolean | string[]) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const newGradeOptions: Array<{ label: string; value: string }> = [];
    let hasVScale = false;
    let hasYDS = false;

    (formValues.types as ActivityType[]).forEach(type => {
      const details = activityTypeDetails[type];
      if (details) {
        if (details.gradeSystem === 'VScale') hasVScale = true;
        if (details.gradeSystem === 'YDS') hasYDS = true;
        if (details.gradeSystem === 'Both') {
          hasVScale = true;
          hasYDS = true;
        }
      }
    });

    if (hasVScale) V_SCALE_GRADES.forEach(g => !newGradeOptions.find(opt => opt.value === g.value) && newGradeOptions.push(g));
    if (hasYDS) YDS_GRADES.forEach(g => !newGradeOptions.find(opt => opt.value === g.value) && newGradeOptions.push(g));
    
    setCurrentGradeOptions(newGradeOptions.sort((a, b) => a.label.localeCompare(b.label)));
    
    const currentSelectedGrades = formValues.grades || [];
    const validSelectedGrades = currentSelectedGrades.filter((g: string) => newGradeOptions.some(opt => opt.value === g));
    if (JSON.stringify(currentSelectedGrades) !== JSON.stringify(validSelectedGrades)) {
      setSpecificFormValue('grades', validSelectedGrades);
    }
  }, [formValues.types, formValues.grades]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    if (!user) {
      showError('请先登录');
      setLoading(false);
      return;
    }
    if (!formValues.types || formValues.types.length === 0) {
      showError('请选择至少一种活动类型');
      setLoading(false);
      return;
    }
    
    // Validate date and time strings
    if (!activityDateString || !startTimeString || !endTimeString) {
      showError('请选择完整的活动日期和时间范围');
      setLoading(false);
      return;
    }

    if (startTimeString >= endTimeString) {
      showError('开始时间必须早于结束时间');
      setLoading(false);
      return;
    }

    const hostId = user.openid;
    const startDateTime = dayjs(activityDateString).hour(dayjs(startTimeString).hour()).minute(dayjs(startTimeString).minute()).second(0).toDate();

    const activityDataForStore: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'host' | 'participants' | 'comments' | 'reviews' | 'datetime'> & { host?: User; description?: string; } = {
      title: formValues.title || '',
      locationText: formValues.locationText || '', 
      hostId,
      host: user,
      types: formValues.types || [],
      grades: formValues.grades || [],
      participantIds: [hostId],
      status: ActivityStatus.OPEN,
      participantCount: 1,
      lat: Number(formValues.lat) || 0,
      lng: Number(formValues.lng) || 0,
      isPrivate: formValues.isPrivate || false,
      meetMode: formValues.meetMode || MeetMode.MEET_AT_ENTRANCE,
      costMode: formValues.costMode || CostMode.AA,
      slotMax: formValues.slotMax || 2,
      description: formValues.description || '',
    };
    
    const newActivityWithId: Activity = {
      ...(activityDataForStore as Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'datetime'>), 
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [], 
      comments: [], 
      reviews: [],
      datetime: startDateTime,
    };

    try {
      await storeAddActivity(newActivityWithId);
      showSuccess('活动创建成功');
      onClose();
    } catch (error) {
      console.error('Error creating activity:', error);
      showError(`创建失败: ${error instanceof Error ? error.message : '请重试'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const activityTypeOptions = (Object.keys(activityTypeDetails) as ActivityType[]).map(typeKey => ({
      label: activityTypeDetails[typeKey].label,
      value: typeKey,
  }));

  const handleActivityTypeCheckboxChange = (typeValue: ActivityType, checked: boolean) => {
    const currentTypes = formValues.types as ActivityType[];
    const newTypes = checked 
      ? [...currentTypes, typeValue]
      : currentTypes.filter(t => t !== typeValue);
    setSpecificFormValue('types', newTypes as ActivityType[]);
  };
  

  const LocationPickerMap: React.FC<{ initialCenter: L.LatLngExpression, currentMarkerPos: L.LatLng | null, onLocationSelect: (latlng: L.LatLng) => void }> = 
    ({ initialCenter, currentMarkerPos, onLocationSelect }) => {
    
    const [displayMarkerPosition, setDisplayMarkerPosition] = useState<L.LatLng | null>(currentMarkerPos);

    const MapEvents = () => {
      const map = useMapEvents({
        click(e: L.LeafletMouseEvent) { 
          setDisplayMarkerPosition(e.latlng);
          onLocationSelect(e.latlng);
        },
        load() { 
          if (currentMarkerPos) {
            map.setView(currentMarkerPos, map.getZoom());
          }
        }
      });
      return null;
    };

    useEffect(() => { 
        setDisplayMarkerPosition(currentMarkerPos);
    }, [currentMarkerPos]);

    return (
      <MapContainer center={initialCenter} zoom={13} style={{ height: '300px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {displayMarkerPosition && <Marker position={displayMarkerPosition}></Marker>}
        <MapEvents />
      </MapContainer>
    );
  };
  
  const openMapPicker = () => {
    const currentLat = formValues.lat;
    const currentLng = formValues.lng;
    if (currentLat && currentLng && !isNaN(Number(currentLat)) && !isNaN(Number(currentLng))) {
      const pos: L.LatLngExpression = [Number(currentLat), Number(currentLng)];
      setMapCenter(pos);
      setMarkerPosition(L.latLng(Number(currentLat), Number(currentLng)));
    } else {
      const defaultCenter: L.LatLngExpression = [39.9042, 116.4074];
      setMapCenter(defaultCenter);
      setMarkerPosition(null); 
    }
    setPoiSearchTerm('');
    setPoiResults([]);
    setShowMapPicker(true);
  };

  const handleMapLocationConfirm = () => {
    if (markerPosition) {
      setSpecificFormValue('lat', markerPosition.lat);
      setSpecificFormValue('lng', markerPosition.lng);
      if (!formValues.locationText) {
        setSpecificFormValue('locationText', `坐标: ${markerPosition.lat.toFixed(4)}, ${markerPosition.lng.toFixed(4)}`);
      }
    }
    setShowMapPicker(false);
  };

  const handleUseCurrentUserLocation = () => {
    if (navigator.geolocation) {
      setIsGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLatLng: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];
          setMapCenter(currentLatLng);
          const newMarkerPos = L.latLng(position.coords.latitude, position.coords.longitude);
          setMarkerPosition(newMarkerPos);
          setSpecificFormValue('lat', newMarkerPos.lat);
          setSpecificFormValue('lng', newMarkerPos.lng);
          setSpecificFormValue('locationText', `当前位置: ${newMarkerPos.lat.toFixed(4)}, ${newMarkerPos.lng.toFixed(4)}`);
          setIsGeolocating(false);
          showSuccess('已定位到当前位置');
        },
        (error) => {
          setIsGeolocating(false);
          showError('无法获取当前位置: ' + error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      showError('浏览器不支持地理位置');
    }
  };

  const handlePoiSearch = (term: string) => {
    setPoiSearchTerm(term);
    if (term.trim() === '') {
      setPoiResults([]);
      return;
    }
    const filteredVenues = VENUES.filter(venue => 
      venue.label.toLowerCase().includes(term.toLowerCase())
    );
    setPoiResults(filteredVenues);
  };

  const handlePoiResultClick = (venue: typeof VENUES[0]) => {
    const venueLatLng: L.LatLngExpression = [venue.lat, venue.lng];
    setMapCenter(venueLatLng);
    const newMarkerPos = L.latLng(venue.lat, venue.lng);
    setMarkerPosition(newMarkerPos);
    setSpecificFormValue('locationText', venue.label);
    setSpecificFormValue('lat', venue.lat);
    setSpecificFormValue('lng', venue.lng);
    setPoiSearchTerm('');
    setPoiResults([]);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-900">创建新活动</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span className="sr-only">关闭</span>
          <CloseCircleOutline className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-4 space-y-6">
        {/* Basic Info Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md shadow-sm bg-white">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3 flex items-center">
            <TextOutline className="mr-2" /> 基础信息
          </h3>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">活动标题 <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formValues.title}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="例如：周末欢乐抱石局"
              maxLength={50}
              required
            />
          </div>
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
            <textarea
              id="description"
              name="description"
              value={formValues.description}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="例如：路线风格、注意事项等 (可选)"
              rows={3}
              maxLength={200}
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md shadow-sm bg-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <EnvironmentOutline className="mr-2" /> 活动地点 <span className="text-red-500">*</span>
            </h3>
            <button type="button" onClick={openMapPicker} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">
              <LocationOutline className="mr-1" /> 地图选择
            </button>
          </div>
          <input
            type="text"
            id="locationText"
            name="locationText"
            value={formValues.locationText}
            onChange={handleFormChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="输入地点或在地图上选择"
            required
          />
        </div>
        
        {/* Activity Type and Grade Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md shadow-sm bg-white">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3 flex items-center">
            <TagOutline className="mr-2" /> 活动类型与难度 <span className="text-red-500">*</span>
          </h3>
          <div className="space-y-2 mb-3">
            <p className="block text-sm font-medium text-gray-700 mb-1">选择活动类型 (可多选):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activityTypeOptions.map(opt => (
                <label key={opt.value} htmlFor={`type-${opt.value}`} className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id={`type-${opt.value}`}
                    name="types" 
                    value={opt.value}
                    checked={(formValues.types as ActivityType[]).includes(opt.value as ActivityType)}
                    onChange={(e) => handleActivityTypeCheckboxChange(opt.value as ActivityType, e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          {(formValues.types as ActivityType[]).length > 0 && currentGradeOptions.length > 0 && (
            <div>
              <label htmlFor="grades" className="block text-sm font-medium text-gray-700 mb-1">难度范围 (可多选):</label>
              <select
                id="grades"
                name="grades"
                value={formValues.grades as string[]}
                onChange={handleFormChange}
                multiple
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                size={Math.min(currentGradeOptions.length, 5)}
              >
                {currentGradeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date and Time Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md shadow-sm bg-white">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3 flex items-center">
            <ClockCircleOutline className="mr-2" /> 活动时间 <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="activityDateString" className="block text-sm font-medium text-gray-700 mb-1">日期:</label>
              <input
                type="date"
                id="activityDateString"
                name="activityDateString"
                value={activityDateString}
                onChange={(e) => setActivityDateString(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min={dayjs().format('YYYY-MM-DD')}
                required
              />
            </div>
            <div>
              <label htmlFor="startTimeString" className="block text-sm font-medium text-gray-700 mb-1">开始时间:</label>
              <input
                type="time"
                id="startTimeString"
                name="startTimeString"
                value={startTimeString}
                onChange={(e) => setStartTimeString(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="endTimeString" className="block text-sm font-medium text-gray-700 mb-1">结束时间:</label>
              <input
                type="time"
                id="endTimeString"
                name="endTimeString"
                value={endTimeString}
                onChange={(e) => setEndTimeString(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md shadow-sm bg-white">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3 flex items-center">
            <TeamOutline className="mr-2" /> 活动设置
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="slotMax" className="block text-sm font-medium text-gray-700 mb-1">人数上限 (含自己):</label>
              <input
                type="number"
                id="slotMax"
                name="slotMax"
                value={formValues.slotMax}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label htmlFor="meetMode" className="block text-sm font-medium text-gray-700 mb-1">集合方式:</label>
              <select
                id="meetMode"
                name="meetMode"
                value={formValues.meetMode}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                {Object.values(MeetMode).map(mode => (
                  <option key={mode} value={mode}>{mode === MeetMode.MEET_AT_ENTRANCE ? '门口集合' : '先到先攀'}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="costMode" className="block text-sm font-medium text-gray-700 mb-1">费用方式:</label>
              <select
                id="costMode"
                name="costMode"
                value={formValues.costMode}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                {Object.values(CostMode).map(mode => (
                  <option key={mode} value={mode}>
                    {mode === CostMode.AA ? 'AA制' : mode === CostMode.HOST_TREAT ? '发起人请客' : '免费'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center pt-5">
              <input type="checkbox" id="isPrivate" name="isPrivate" checked={formValues.isPrivate} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2" />
              <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">设为私密活动 (仅受邀者可见)</label>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="pt-2 pb-6 sticky bottom-0 bg-white">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={loading}>
            {loading ? '发布中...' : '发布活动'}
          </button>
        </div>
      </form>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">选择地点</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={poiSearchTerm} 
                  onChange={(e) => handlePoiSearch(e.target.value)}
                  placeholder="搜索地点 (如: 岩馆名称)"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm flex-grow"
                />
                 <button type="button" onClick={handleUseCurrentUserLocation} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500" disabled={isGeolocating}>
                  {isGeolocating ? '定位中...' : <><LocationOutline className="mr-1" />用当前位置</> }
                </button>
              </div>
              {poiResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {poiResults.map(venue => (
                    <div 
                      key={venue.value} 
                      onClick={() => handlePoiResultClick(venue)}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      {venue.label}
                    </div>
                  ))}
                </div>
              )}
              <div className="h-80 w-full"> {/* Ensure map has a defined height */}
                <LocationPickerMap 
                  initialCenter={mapCenter} 
                  currentMarkerPos={markerPosition}
                  onLocationSelect={(latlng) => {
                    setMarkerPosition(latlng);
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button type="button" onClick={() => setShowMapPicker(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">取消</button>
              <button type="button" onClick={handleMapLocationConfirm} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateActivity;