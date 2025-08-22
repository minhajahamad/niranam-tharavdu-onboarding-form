import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  User,
  Phone,
  Briefcase,
  Users,
  Heart,
  Camera,
  Calendar,
  MapPin,
  Mail,
  Building,
  UserCheck,
} from 'lucide-react';
import axiosInstance from '@/components/apiconfig/axios';
import { API_URL } from '@/components/apiconfig/api_url';

interface Contact {
  id: number;
  member_name: string;
  phone_number: string;
  whatsapp_number: string;
  email: string | null;
  address: string;
}

interface Employment {
  id: number;
  member_name: string;
  job_status: string;
  company_name: string;
  designation: string;
  work_location: string;
}

interface Member {
  id: number;
  head_branch: string;
  name: string;
  is_deceased: boolean;
  gender: string;
  date_of_birth: string;
  date_of_death?: string | null;
  marital_status: string;
  spouse_name: string | null;
  wedding_anniversary: string | null;
  father_name: string | null;
  mother_name: string | null;
  number_of_children: number;
  personal_photo: string | null;
  family_photo: string | null;
  created_at: string;
  updated_at: string;
  head: string;
  contacts: Contact[];
  employments: Employment[];
}

interface ApiResponse {
  message: string;
  data: Member; // Changed from Member[] to Member
}

interface PreviewStepProps {
  onEdit: (step: number) => void;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({ onEdit }) => {
  const [data, setData] = useState<Member | null>(null); // Changed to single Member
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const headUuid = localStorage.getItem('familyHeadUuid');
        if (!headUuid) {
          setError('Family Head UUID not found in localStorage');
          return;
        }

        const memberId = localStorage.getItem('member_id');
        const Id = parseInt(memberId);
        if (!Id) {
          setError('Member Id not found');
          return;
        }

        const res = await axiosInstance.get<ApiResponse>(
          API_URL.PREVIEW_DETAILS.GET_PREVIEW_DETAILS_WITH_ID(headUuid, Id)
        );

        if (res.data && res.data.data) {
          setData(res.data.data);
          console.log('Fetched member details:', res.data.data);
        } else {
          setError('No data received from API');
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Failed to fetch member details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  console.log(data);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-family-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No member details found.</p>
      </div>
    );
  }

  const InfoCard = ({
    title,
    icon,
    children,
    onEditClick,
    className = '',
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onEditClick: () => void;
    className?: string;
  }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon} {title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="flex items-center gap-1"
        >
          <Edit className="h-3 w-3" /> Edit
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const DetailRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value?: string | number | null;
    icon?: React.ReactNode;
  }) => {
    // Don't render if value is null, undefined, empty string, or 0 for optional numeric fields
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // For number of children, show 0 as it's meaningful information
    if (label === 'Number of Children' && value === 0) {
      // Show 0 for number of children as it's valid information
    } else if (typeof value === 'number' && value === 0 && label !== 'Number of Children') {
      return null;
    }

    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-muted-foreground flex items-center gap-2">
          {icon && icon}
          {label}:
        </span>
        <span className="font-medium text-right max-w-[60%]">{value}</span>
      </div>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isAlive = !data.is_deceased;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Review Registration Details</h2>
        <p className="text-muted-foreground">
          Please review all information before submitting your registration
        </p>
        <Badge variant="secondary" className="mt-2">
          Member Details
        </Badge>
      </div>

      <div className="space-y-4 border-2 border-gray-100 p-6 rounded-xl shadow-lg bg-white">
        {/* Member Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-family-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-family-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{data.name}</h3>
              <p className="text-muted-foreground text-sm">
                Member Details
              </p>
            </div>
          </div>
          {!isAlive && (
            <Badge variant="secondary" className="bg-gray-100">
              <Heart className="h-3 w-3 mr-1" />
              Deceased
            </Badge>
          )}
        </div>

        {/* Family Details */}
        <InfoCard
          title="Family Information"
          icon={<Users className="h-5 w-5 text-family-primary" />}
          onEditClick={() => onEdit(1)}
        >
          <DetailRow
            label="Branch"
            value={data.head_branch}
            icon={<Users className="h-4 w-4" />}
          />
        </InfoCard>

        {/* Personal Details */}
        <InfoCard
          title="Personal Details"
          icon={<User className="h-5 w-5 text-family-primary" />}
          onEditClick={() => onEdit(2)}
        >
          <DetailRow
            label="Full Name"
            value={data.name}
            icon={<User className="h-4 w-4" />}
          />
          <DetailRow
            label="Gender"
            value={data.gender}
            icon={<UserCheck className="h-4 w-4" />}
          />
          <DetailRow
            label="Date of Birth"
            value={formatDate(data.date_of_birth)}
            icon={<Calendar className="h-4 w-4" />}
          />
          {data.is_deceased && (
            <DetailRow
              label="Date of Death"
              value={formatDate(data.date_of_death)}
              icon={<Calendar className="h-4 w-4" />}
            />
          )}
          <DetailRow
            label="Marital Status"
            value={data.marital_status}
            icon={<Heart className="h-4 w-4" />}
          />
          <DetailRow
            label="Spouse Name"
            value={data.spouse_name}
            icon={<User className="h-4 w-4" />}
          />
          <DetailRow
            label="Wedding Anniversary"
            value={formatDate(data.wedding_anniversary)}
            icon={<Calendar className="h-4 w-4" />}
          />
          <DetailRow
            label="Father's Name"
            value={data.father_name}
            icon={<User className="h-4 w-4" />}
          />
          <DetailRow
            label="Mother's Name"
            value={data.mother_name}
            icon={<User className="h-4 w-4" />}
          />
          <DetailRow
            label="Number of Children"
            value={data.number_of_children}
            icon={<Users className="h-4 w-4" />}
          />

          {/* Photos Section */}
          {(data.personal_photo || data.family_photo) && (
            <div className="pt-4 border-t mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4 text-family-primary" />
                <span className="font-medium text-family-primary">
                  Uploaded Photos
                </span>
              </div>
              <div className="flex gap-4 flex-wrap">
                {data.personal_photo && (
                  <div className="text-center">
                    <img
                      src={data.personal_photo}
                      alt={`${data.name} - Personal Photo`}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Personal
                    </p>
                  </div>
                )}
                {data.family_photo && (
                  <div className="text-center">
                    <img
                      src={data.family_photo}
                      alt={`${data.name} - Family Photo`}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Family
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </InfoCard>

        {/* Contact & Employment for Living Members */}
        {isAlive ? (
          <>
            {/* Contact Information */}
            {data.contacts && data.contacts.length > 0 && (
              <InfoCard
                title="Contact Information"
                icon={<Phone className="h-5 w-5 text-family-primary" />}
                onEditClick={() => onEdit(3)}
              >
                {data.contacts.map((contact, contactIdx) => (
                  <div key={contact.id} className="space-y-2">
                    {contactIdx > 0 && <hr className="my-4" />}
                    <DetailRow
                      label="Phone Number"
                      value={contact.phone_number}
                      icon={<Phone className="h-4 w-4" />}
                    />
                    <DetailRow
                      label="WhatsApp Number"
                      value={contact.whatsapp_number}
                      icon={<Phone className="h-4 w-4" />}
                    />
                    <DetailRow
                      label="Email Address"
                      value={contact.email}
                      icon={<Mail className="h-4 w-4" />}
                    />
                    <DetailRow
                      label="Address"
                      value={contact.address}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                  </div>
                ))}
              </InfoCard>
            )}

            {/* Employment Information */}
            {data.employments && data.employments.length > 0 && (
              <InfoCard
                title="Employment Information"
                icon={<Briefcase className="h-5 w-5 text-family-primary" />}
                onEditClick={() => onEdit(4)}
              >
                {data.employments.map((employment, empIdx) => (
                  <div key={employment.id} className="space-y-2">
                    {empIdx > 0 && <hr className="my-4" />}
                    <DetailRow
                      label="Job Status"
                      value={employment.job_status}
                      icon={<UserCheck className="h-4 w-4" />}
                    />
                    <DetailRow
                      label="Company Name"
                      value={employment.company_name}
                      icon={<Building className="h-4 w-4" />}
                    />
                    <DetailRow
                      label="Designation"
                      value={employment.designation}
                      icon={<Briefcase className="h-4 w-4" />}
                    />
                    <DetailRow
                      label="Work Location"
                      value={employment.work_location}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                  </div>
                ))}
              </InfoCard>
            )}
          </>
        ) : null}

        {/* Timestamps (Optional - for admin view) */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          <p>Created: {new Date(data.created_at).toLocaleString()}</p>
          <p>Last Updated: {new Date(data.updated_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
