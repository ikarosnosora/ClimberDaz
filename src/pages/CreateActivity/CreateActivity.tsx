import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ActivityType, 
  MeetMode, 
  CostMode, 
  DifficultyGrade
} from '../../types';
import { useStore } from '../../store/useStore';
import { ClimbingGymSelector } from '../../components/ClimbingGymSelector/ClimbingGymSelector';
import { toast } from 'react-toastify';
import './CreateActivity.css';

// Modern SVG Icon Components

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



const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

// Import Leaflet images directly - commented out as not used currently
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// TODO: Fix for default Leaflet marker icon issue with webpack when map is implemented
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

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

// Define proper form data interface
interface ActivityFormData {
  title: string;
  description: string;
  types: ActivityType[];
  grades: DifficultyGrade[];
  slotMax: number;
  meetMode: MeetMode;
  costMode: CostMode;
  cost: number;
  isPrivate: boolean;
  selectedGym: any | null; // Using any for now to avoid type issues
}



export const CreateActivity: React.FC = () => {
  const navigate = useNavigate();
  const { user, activities, setActivities } = useStore();
  
  const [formValues, setFormValues] = useState<ActivityFormData>({
    title: '',
    description: '',
    types: [ActivityType.BOULDERING],
    grades: [DifficultyGrade.V0_V2],
    slotMax: 4,
    meetMode: MeetMode.MEET_AT_ENTRANCE,
    costMode: CostMode.AA,
    cost: 0,
    isPrivate: false,
    selectedGym: null
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create an activity');
      return;
    }
    
    if (!formValues.selectedGym) {
      toast.error('Please select a climbing gym');
      return;
    }
    
    try {
      const activityData = {
        title: formValues.title,
        description: formValues.description,
        types: formValues.types,
        grades: formValues.grades,
        slotMax: formValues.slotMax,
        meetMode: formValues.meetMode,
        costMode: formValues.costMode,
        cost: formValues.costMode === CostMode.HOST_TREAT ? formValues.cost : 0,
        isPrivate: formValues.isPrivate,
        gymId: formValues.selectedGym.id,
        organizerId: user.openid,
        // Add required fields for Activity type
        id: Date.now().toString(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        status: 'OPEN' as any,
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // For now, just add to local store until API is ready
      setActivities([...activities, activityData as any]);
      toast.success('Activity created successfully!');
      navigate('/activities');
    } catch (error) {
      toast.error('Failed to create activity. Please try again.');
    }
  };

  return (
    <div className="create-activity-overlay">
      {/* Enhanced Header */}
      <div className="create-activity-header">
        <div className="header-content">
          <button
            type="button"
            onClick={() => navigate(-1)}
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

      <form onSubmit={handleSubmit} className="create-activity-form">
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
              onChange={(e) => setFormValues(prev => ({ ...prev, title: e.target.value }))}
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
              onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
              className="form-textarea"
              placeholder="分享更多详情：路线风格、集合点、注意事项等..."
              rows={3}
              maxLength={200}
            />
          </div>
        </div>

        {/* Climbing Gym Selection Section */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <LocationIcon />
            </div>
            <div>
              <h3 className="section-title">选择岩馆</h3>
              <p className="section-description">从官方岩馆列表中选择</p>
            </div>
          </div>
          
          <div className="form-group">
            <ClimbingGymSelector
              selectedGymId={formValues.selectedGym?.id}
              onGymSelect={(gym) => setFormValues(prev => ({ ...prev, selectedGym: gym }))}
              required
              placeholder="请选择攀岩馆"
              className="w-full"
            />
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
                    onChange={(e) => setFormValues(prev => ({ ...prev, types: [...(prev.types as ActivityType[]), e.target.value as ActivityType] } as ActivityFormData) as ActivityFormData)}
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
          
          {(formValues.types as ActivityType[]).length > 0 && (
            <div className="form-group">
              <label htmlFor="grades" className="form-label">
                难度范围 <small className="text-gray-500">(可多选)</small>
              </label>
              <select
                id="grades"
                name="grades"
                value={formValues.grades as string[]}
                onChange={(e) => setFormValues(prev => ({ ...prev, grades: [...(prev.grades as string[]), e.target.value] } as ActivityFormData) as ActivityFormData)}
                multiple
                className="form-select grade-select"
                size={Math.min((formValues.types as ActivityType[]).length, 5)}
              >
                {VENUES.map(venue => (
                  <option key={venue.value} value={venue.value}>{venue.label}</option>
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
              <label htmlFor="slotMax" className="form-label">人数上限</label>
              <div className="number-input-wrapper">
                <UsersIcon />
                <input
                  type="number"
                  id="slotMax"
                  name="slotMax"
                  value={formValues.slotMax}
                  onChange={(e) => setFormValues(prev => ({ ...prev, slotMax: parseInt(e.target.value, 10) || 1 } as ActivityFormData) as ActivityFormData)}
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
                onChange={(e) => setFormValues(prev => ({ ...prev, meetMode: e.target.value as MeetMode } as ActivityFormData) as ActivityFormData)}
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
                onChange={(e) => setFormValues(prev => ({ ...prev, costMode: e.target.value as CostMode } as ActivityFormData) as ActivityFormData)}
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
                onChange={(e) => setFormValues(prev => ({ ...prev, isPrivate: e.target.checked } as ActivityFormData) as ActivityFormData)}
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
          >
            <div className="submit-content">
              <SparklesIcon />
              <span>发布活动</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateActivity;