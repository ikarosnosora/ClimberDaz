import React, { useState, useEffect, FormEvent } from 'react';
// import { List, Button, Modal, Form, Input, DatePicker, Toast, TextArea } from 'antd-mobile'; // Removed
// import { AddOutline, EditSOutline, DeleteOutline } from 'antd-mobile-icons'; // Removed
import { useStore } from '../../store/useStore';
import type { Announcement } from '../../types';
import dayjs from 'dayjs';
import DateTimePicker from '../../components/FormComponents/DateTimePicker'; // Using our refactored component
import { showSuccess } from '../../utils/notifications';

// SVG Icons
const PlusIcon = ({ className = "w-5 h-5"}: { className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EditIcon = ({ className = "w-5 h-5"}: { className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5"}: { className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.077m3.22-.077L10.875 5.79m0 0a48.267 48.267 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

// Basic Form Input and TextArea (can be shared)
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, name, type = "text", error, ...props }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input id={name} name={name} type={type} {...props} className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }> = ({ label, name, error, ...props }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea id={name} name={name} {...props} className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);


interface AnnouncementFormValues {
  id?: string;
  title: string;
  content: string;
  startAt: Date;
  endAt: Date;
  weight?: number;
}

const initialFormState: AnnouncementFormValues = {
  title: '',
  content: '',
  startAt: new Date(),
  endAt: dayjs().add(7, 'day').toDate(),
  weight: 1,
};

const AnnouncementManagement: React.FC = () => {
  const { announcements, setAnnouncements } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormValues>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof AnnouncementFormValues, string>>>({});

  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        id: editingAnnouncement.id,
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        startAt: dayjs(editingAnnouncement.startAt).toDate(),
        endAt: dayjs(editingAnnouncement.endAt).toDate(),
        weight: editingAnnouncement.weight || 1,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [editingAnnouncement, isModalVisible]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'weight' ? (value === '' ? undefined : Number(value)) : value }));
    if (errors[name as keyof AnnouncementFormValues]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleDateChange = (name: keyof AnnouncementFormValues, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date }));
       if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AnnouncementFormValues, string>> = {};
    if (!formData.title.trim()) newErrors.title = '标题不能为空';
    if (!formData.content.trim()) newErrors.content = '内容不能为空';
    if (!formData.startAt) newErrors.startAt = '开始日期不能为空';
    if (!formData.endAt) newErrors.endAt = '结束日期不能为空';
    if (formData.startAt && formData.endAt && dayjs(formData.endAt).isBefore(dayjs(formData.startAt))) {
      newErrors.endAt = '结束日期不能早于开始日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingAnnouncement) {
      const updatedAnnouncements = announcements.map(ann =>
        ann.id === editingAnnouncement.id ? { ...ann, ...formData, updatedAt: new Date() } : ann
      );
      setAnnouncements(updatedAnnouncements as Announcement[]);
      showSuccess('公告已更新');
    } else {
      const newAnnouncement: Announcement = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date(),
        weight: formData.weight || 1,
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      showSuccess('公告已添加');
    }
    setIsModalVisible(false);
  };

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setIsModalVisible(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // Modal.confirm replacement with window.confirm
    if (window.confirm('确定要删除这条公告吗？')) {
      const updatedAnnouncements = announcements.filter(ann => ann.id !== id);
      setAnnouncements(updatedAnnouncements);
      showSuccess('公告已删除');
    }
  };
  
  const closeModal = () => {
    setIsModalVisible(false);
    setEditingAnnouncement(null);
  }

  // Styles from parent component (AdminDashboardPage) provide overall card structure and title for this section.
  // style={{ marginTop: '20px' }} and h3 removed.
  // style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}} -> Tailwind classes
  return (
    <div className="announcement-management">
      <div className="flex justify-between items-center mb-3">
        {/* Title is now part of the parent AdminDashboardPage section card */}
        <button
          onClick={handleAdd}
          className="flex items-center text-white text-sm font-medium py-2 px-3 rounded-md shadow-sm transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%)',
            boxShadow: '0 2px 8px rgba(255, 126, 95, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #FF8E7B 0%, #FF5A88 100%)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 126, 95, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 126, 95, 0.3)';
          }}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          新增公告
        </button>
      </div>

      {/* List replacement */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        {announcements.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">暂无公告</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {announcements.map(ann => (
              <li key={ann.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      有效期: {dayjs(ann.startAt).format('YYYY-MM-DD')} - {dayjs(ann.endAt).format('YYYY-MM-DD')} (权重: {ann.weight || 1})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEdit(ann)} 
                      className="p-1 transition-all duration-200 hover:scale-110"
                      style={{ color: '#FF7E5F' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#E91E63';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#FF7E5F';
                      }}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(ann.id)} className="p-1 text-red-600 hover:text-red-800 transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal for Add/Edit Announcement */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingAnnouncement ? '编辑公告' : '添加新公告'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <FormInput
                label="标题"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入公告标题"
                error={errors.title}
                required
              />
              <FormTextArea
                label="内容"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="请输入公告内容"
                rows={4}
                error={errors.content}
                required
              />
              <DateTimePicker // Using the refactored component
                label="开始日期时间"
                value={formData.startAt}
                onChange={(date) => handleDateChange('startAt', date)}
                className="mb-4"
              />
               {errors.startAt && <p className="mt-[-0.75rem] mb-2 text-xs text-red-500">{errors.startAt}</p>}

              <DateTimePicker // Using the refactored component
                label="结束日期时间"
                value={formData.endAt}
                onChange={(date) => handleDateChange('endAt', date)}
                className="mb-4"
              />
              {errors.endAt && <p className="mt-[-0.75rem] mb-2 text-xs text-red-500">{errors.endAt}</p>}
              
              <FormInput
                label="权重 (数字越大越靠前)"
                name="weight"
                type="number"
                value={formData.weight === undefined ? '' : String(formData.weight)}
                onChange={handleInputChange}
                placeholder="默认为1"
                min="0"
              />

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  取消
                </button>
                                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%)',
                      boxShadow: '0 2px 8px rgba(255, 126, 95, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #FF8E7B 0%, #FF5A88 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 126, 95, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 126, 95, 0.3)';
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '2px solid rgba(255, 126, 95, 0.5)';
                      e.currentTarget.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    {editingAnnouncement ? '更新公告' : '创建公告'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement; 