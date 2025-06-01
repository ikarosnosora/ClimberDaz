import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Modern SVG Icon Components
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

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

// Activity type options with enhanced labeling
const activityTypeOptions = [
  { value: ActivityType.BOULDERING, label: '抱石 🧗‍♀️', icon: '🪨' },
  { value: ActivityType.TOP_ROPE_AUTO_BELAY, label: '上方保护（自动） ⬆️', icon: '🔗' },
  { value: ActivityType.TOP_ROPE_MANUAL_BELAY, label: '上方保护（人工） ⬆️', icon: '🔗' },
  { value: ActivityType.LEAD_CLIMBING, label: '先锋攀登 🚀', icon: '🚀' },
  { value: ActivityType.OUTDOOR, label: '户外攀岩 🏔️', icon: '🏔️' },
  { value: ActivityType.TRAINING, label: '训练 💪', icon: '💪' },
];

interface CreateActivityProps {
  // Remove onClose prop since this is now a page
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

const CreateActivity: React.FC<CreateActivityProps> = () => {
  const navigate = useNavigate();
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
      showSuccess('活动发布成功！');
      navigate(-1); // Go back to previous page
    } catch (error) {
      showError('发布活动时遇到错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityTypeCheckboxChange = (typeValue: ActivityType, checked: boolean) => {
    const updatedTypes = checked 
      ? [...(formValues.types as ActivityType[]), typeValue]
      : (formValues.types as ActivityType[]).filter(t => t !== typeValue);
    setSpecificFormValue('types', updatedTypes);
  };

  const LocationPickerMap: React.FC<{ initialCenter: L.LatLngExpression, currentMarkerPos: L.LatLng | null, onLocationSelect: (latlng: L.LatLng) => void }> = 
    ({ initialCenter, currentMarkerPos, onLocationSelect }) => {
    const [mapRef, setMapRef] = useState<L.Map | null>(null);

    const MapEvents = () => {
      const mapEvents = useMapEvents({
        click(e: L.LeafletMouseEvent) { 
          onLocationSelect(e.latlng);
        },
        load() { 
          // Map loaded
        }
      });
      
      useEffect(() => {
        setMapRef(mapEvents);
      }, [mapEvents]);
      
      return null;
    };

    useEffect(() => {
      if (mapRef && initialCenter) {
        mapRef.setView(initialCenter as L.LatLngTuple, 13);
      }
    }, [mapRef, initialCenter]);

    return (
      <MapContainer
        center={initialCenter as L.LatLngTuple}
        zoom={13}
        style={{ height: '300px', width: '100%' }}
        className="rounded-lg overflow-hidden shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {currentMarkerPos && <Marker position={currentMarkerPos} />}
        <MapEvents />
      </MapContainer>
    );
  };

  const openMapPicker = () => {
    if (formValues.lat && formValues.lng) {
      setMapCenter([formValues.lat, formValues.lng]);
      setMarkerPosition(new L.LatLng(formValues.lat, formValues.lng));
    }
    setShowMapPicker(true);
  };

  const handleMapLocationConfirm = () => {
    if (markerPosition) {
      setSpecificFormValue('lat', markerPosition.lat);
      setSpecificFormValue('lng', markerPosition.lng);
      if (!formValues.locationText) {
        setSpecificFormValue('locationText', `纬度: ${markerPosition.lat.toFixed(6)}, 经度: ${markerPosition.lng.toFixed(6)}`);
      }
    }
    setShowMapPicker(false);
  };

  const handleUseCurrentUserLocation = () => {
    if (!navigator.geolocation) {
      showError('您的浏览器不支持地理定位');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newPos = new L.LatLng(lat, lng);
        setMarkerPosition(newPos);
        setMapCenter([lat, lng]);
        setIsGeolocating(false);
        showSuccess('已获取当前位置');
      },
      (error) => {
        setIsGeolocating(false);
        showError('无法获取当前位置，请检查位置权限设置');
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
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
    const newPos = new L.LatLng(venue.lat, venue.lng);
    setMarkerPosition(newPos);
    setMapCenter([venue.lat, venue.lng]);
    setPoiSearchTerm(venue.label);
    setPoiResults([]);
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="create-activity-overlay">
      {/* Enhanced Header */}
      <div className="create-activity-header">
        <div className="header-content">
          <button
            type="button"
            onClick={handleClose}
            className="close-button"
            aria-label="返回"
          >
            <BackIcon />
          </button>
          <div className="header-title-section">
            <div className="title-with-icon">
              <div className="title-icon-wrapper">
                <SparklesIcon />
              </div>
              <h1 className="header-title">创建新活动</h1>
            </div>
            <p className="header-subtitle">让我们一起攀岩吧！</p>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      <form onSubmit={onSubmit} className="create-activity-form">
        {/* Basic Info Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <DocumentIcon />
            </div>
            <div>
              <h3 className="section-title">基础信息</h3>
              <p className="section-description">让大家了解你的活动</p>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              活动标题 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formValues.title}
              onChange={handleFormChange}
              className="form-input"
              placeholder="例如：周末欢乐抱石局 🧗‍♀️"
              maxLength={50}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              活动描述
            </label>
            <textarea
              id="description"
              name="description"
              value={formValues.description}
              onChange={handleFormChange}
              className="form-textarea"
              placeholder="分享更多详情：路线风格、集合点、注意事项等..."
              rows={3}
              maxLength={200}
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <LocationIcon />
            </div>
            <div>
              <h3 className="section-title">活动地点</h3>
              <p className="section-description">在哪里攀岩？</p>
            </div>
          </div>
          
          <div className="location-input-group">
            <div className="form-group">
              <input
                type="text"
                id="locationText"
                name="locationText"
                value={formValues.locationText}
                onChange={handleFormChange}
                className="form-input location-input"
                placeholder="输入地点名称或地址"
                required
              />
            </div>
            <button 
              type="button" 
              onClick={openMapPicker} 
              className="map-picker-button"
            >
              <MapIcon />
              <span>地图选择</span>
            </button>
          </div>
        </div>
        
        {/* Activity Type and Grade Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <TagIcon />
            </div>
            <div>
              <h3 className="section-title">活动类型与难度</h3>
              <p className="section-description">选择攀岩类型和难度范围</p>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              活动类型 <span className="required">*</span>
            </label>
            <div className="activity-type-grid">
              {activityTypeOptions.map(opt => (
                <label key={opt.value} className="activity-type-option">
                  <input 
                    type="checkbox" 
                    name="types" 
                    value={opt.value}
                    checked={(formValues.types as ActivityType[]).includes(opt.value as ActivityType)}
                    onChange={(e) => handleActivityTypeCheckboxChange(opt.value as ActivityType, e.target.checked)}
                    className="activity-type-checkbox"
                  />
                  <div className="activity-type-content">
                    <span className="activity-type-icon">{opt.icon}</span>
                    <span className="activity-type-label">{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {(formValues.types as ActivityType[]).length > 0 && currentGradeOptions.length > 0 && (
            <div className="form-group">
              <label htmlFor="grades" className="form-label">
                难度范围 <small className="text-gray-500">(可多选)</small>
              </label>
              <select
                id="grades"
                name="grades"
                value={formValues.grades as string[]}
                onChange={handleFormChange}
                multiple
                className="form-select grade-select"
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
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <ClockIcon />
            </div>
            <div>
              <h3 className="section-title">活动时间</h3>
              <p className="section-description">什么时候开始攀岩？</p>
            </div>
          </div>
          
          <div className="datetime-grid">
            <div className="form-group">
              <label htmlFor="activityDateString" className="form-label">日期 <span className="required">*</span></label>
              <input
                type="date"
                id="activityDateString"
                name="activityDateString"
                value={activityDateString}
                onChange={(e) => setActivityDateString(e.target.value)}
                className="form-input"
                min={dayjs().format('YYYY-MM-DD')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="startTimeString" className="form-label">开始时间 <span className="required">*</span></label>
              <input
                type="time"
                id="startTimeString"
                name="startTimeString"
                value={startTimeString}
                onChange={(e) => setStartTimeString(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTimeString" className="form-label">结束时间 <span className="required">*</span></label>
              <input
                type="time"
                id="endTimeString"
                name="endTimeString"
                value={endTimeString}
                onChange={(e) => setEndTimeString(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <SettingsIcon />
            </div>
            <div>
              <h3 className="section-title">活动设置</h3>
              <p className="section-description">配置活动的具体安排</p>
            </div>
          </div>
          
          <div className="settings-grid">
            <div className="form-group">
              <label htmlFor="slotMax" className="form-label">人数上限</label>
              <div className="number-input-wrapper">
                <UsersIcon />
                <input
                  type="number"
                  id="slotMax"
                  name="slotMax"
                  value={formValues.slotMax}
                  onChange={handleFormChange}
                  className="form-input number-input"
                  min="1"
                  max="50"
                  required
                />
                <span className="input-suffix">人 (含自己)</span>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="meetMode" className="form-label">集合方式</label>
              <select
                id="meetMode"
                name="meetMode"
                value={formValues.meetMode}
                onChange={handleFormChange}
                className="form-select"
                required
              >
                {Object.values(MeetMode).map(mode => (
                  <option key={mode} value={mode}>
                    {mode === MeetMode.MEET_AT_ENTRANCE ? '🚪 门口集合' : '🏃‍♂️ 先到先攀'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="costMode" className="form-label">费用方式</label>
              <select
                id="costMode"
                name="costMode"
                value={formValues.costMode}
                onChange={handleFormChange}
                className="form-select"
                required
              >
                {Object.values(CostMode).map(mode => (
                  <option key={mode} value={mode}>
                    {mode === CostMode.AA ? '💰 AA制' : mode === CostMode.HOST_TREAT ? '🎁 发起人请客' : '🆓 免费'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                id="isPrivate" 
                name="isPrivate" 
                checked={formValues.isPrivate} 
                onChange={handleFormChange} 
                className="form-checkbox" 
              />
              <span className="checkbox-text">
                🔒 设为私密活动 <small className="text-gray-500">(仅受邀者可见)</small>
              </span>
            </label>
          </div>
        </div>
        
        {/* Enhanced Submit Button */}
        <div className="submit-section">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <span>发布中...</span>
              </div>
            ) : (
              <div className="submit-content">
                <SparklesIcon />
                <span>发布活动</span>
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Enhanced Map Picker Modal */}
      {showMapPicker && (
        <div className="map-modal-overlay">
          <div className="map-modal">
            <div className="map-modal-header">
              <h3 className="map-modal-title">选择活动地点</h3>
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="map-modal-close"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="map-modal-content">
              <div className="map-search-section">
                <div className="search-input-group">
                  <input 
                    type="text" 
                    value={poiSearchTerm} 
                    onChange={(e) => handlePoiSearch(e.target.value)}
                    placeholder="搜索岩馆或地点名称..."
                    className="search-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleUseCurrentUserLocation} 
                    className="location-button"
                    disabled={isGeolocating}
                  >
                    {isGeolocating ? (
                      <div className="loading-spinner small"></div>
                    ) : (
                      <LocationIcon />
                    )}
                    <span>{isGeolocating ? '定位中...' : '当前位置'}</span>
                  </button>
                </div>
                
                {poiResults.length > 0 && (
                  <div className="search-results">
                    {poiResults.map(venue => (
                      <button
                        key={venue.value} 
                        onClick={() => handlePoiResultClick(venue)}
                        className="search-result-item"
                      >
                        <LocationIcon />
                        <span>{venue.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="map-container">
                <LocationPickerMap
                  initialCenter={mapCenter}
                  currentMarkerPos={markerPosition}
                  onLocationSelect={setMarkerPosition}
                />
              </div>
              
              <div className="map-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowMapPicker(false)}
                  className="map-button-secondary"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleMapLocationConfirm}
                  className="map-button-primary"
                  disabled={!markerPosition}
                >
                  确认位置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateActivity;