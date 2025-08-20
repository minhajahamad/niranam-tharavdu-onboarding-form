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
} from 'lucide-react';
import axiosInstance from '@/components/apiconfig/axios';
import { API_URL } from '@/components/apiconfig/api_url';

interface PreviewStepProps {
  onEdit: (step: number) => void;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({ onEdit }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const headUuid = localStorage.getItem('familyHeadUuid');
        if (!headUuid) return;

        const res = await axiosInstance.get(
          `${API_URL.PREVIEW_DETAILS.GET_FULL_DETAILS}${headUuid}/`
        );
        setData(res.data.data); // data is array of members
        console.log(res.data.data);
      } catch (err) {
        console.error('Error fetching details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  if (loading) {
    return <p className="text-center">Loading preview...</p>;
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No details found.</p>
    );
  }

  const InfoCard = ({
    title,
    icon,
    children,
    onEditClick,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onEditClick: () => void;
  }) => (
    <Card>
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
  }: {
    label: string;
    value?: string | number | null;
  }) =>
    value ? (
      <div className="flex justify-between py-1">
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{value}</span>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Registration Details</h2>
        <p className="text-muted-foreground">
          Please review all information before submitting
        </p>
      </div>

      {data.map((member, idx) => {
        const isAlive = !member.is_deceased;

        return (
          <div key={idx} className="space-y-6 border p-4 rounded-xl shadow-sm">
            {/* Family Details */}
            <InfoCard
              title="Family Details"
              icon={<Users className="h-5 w-5 text-family-primary" />}
              onEditClick={() => onEdit(1)}
            >
              <DetailRow label="Head / Branch" value={member.head_branch} />
            </InfoCard>

            {/* Personal Details */}
            <InfoCard
              title="Personal Details"
              icon={<User className="h-5 w-5 text-family-primary" />}
              onEditClick={() => onEdit(2)}
            >
              <DetailRow label="Member Name" value={member.name} />
              <DetailRow label="Gender" value={member.gender} />
              <DetailRow label="Date of Birth" value={member.date_of_birth} />
              {member.is_deceased && member.date_of_death && (
                <DetailRow label="Date of Death" value={member.date_of_death} />
              )}
              <DetailRow label="Marital Status" value={member.marital_status} />
              <DetailRow label="Spouse Name" value={member.spouse_name} />
              <DetailRow label="Father Name" value={member.father_name} />
              <DetailRow label="Mother Name" value={member.mother_name} />
              <DetailRow
                label="Number of Children"
                value={member.number_of_children}
              />

              {(member.personal_photo || member.family_photo) && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-4 w-4" />
                    <span className="font-medium">Photos</span>
                  </div>
                  <div className="flex gap-4">
                    {member.personal_photo && (
                      <img
                        src={member.personal_photo}
                        alt="Personal"
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    {member.family_photo && (
                      <img
                        src={member.family_photo}
                        alt="Family"
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              )}
            </InfoCard>

            {/* If Alive → show contact & employment */}
            {isAlive ? (
              <>
                {/* Contact */}
                <InfoCard
                  title="Contact Information"
                  icon={<Phone className="h-5 w-5 text-family-primary" />}
                  onEditClick={() => onEdit(3)}
                >
                  {member.contacts.length > 0 && (
                    <>
                      <DetailRow
                        label="Contact Number"
                        value={member.contacts[0].phone_number}
                      />
                      <DetailRow
                        label="WhatsApp Number"
                        value={member.contacts[0].whatsapp_number}
                      />
                      <DetailRow
                        label="Email"
                        value={member.contacts[0].email}
                      />
                      <DetailRow
                        label="Address"
                        value={member.contacts[0].address}
                      />
                    </>
                  )}
                </InfoCard>

                {/* Employment */}
                <InfoCard
                  title="Employment Information"
                  icon={<Briefcase className="h-5 w-5 text-family-primary" />}
                  onEditClick={() => onEdit(4)}
                >
                  {member.employments.length > 0 && (
                    <>
                      <DetailRow
                        label="Job Status"
                        value={member.employments[0].job_status}
                      />
                      <DetailRow
                        label="Company Name"
                        value={member.employments[0].company_name}
                      />
                      <DetailRow
                        label="Designation"
                        value={member.employments[0].designation}
                      />
                      <DetailRow
                        label="Work Location"
                        value={member.employments[0].work_location}
                      />
                    </>
                  )}
                </InfoCard>
              </>
            ) : (
              <Card className="border-muted">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Contact and Employment information not applicable</p>
                    <p className="text-sm">This member is no longer with us</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
};
