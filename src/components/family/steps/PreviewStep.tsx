import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, User, Phone, Briefcase, Users, Heart, Camera } from 'lucide-react';
import { FormData } from '../types';

interface PreviewStepProps {
  formData: FormData;
  onEdit: (step: number) => void;
  isAlive: boolean;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  formData,
  onEdit,
  isAlive
}) => {
  const { familyDetails, personalDetails, contactInfo, employment } = formData;

  const InfoCard = ({ 
    title, 
    icon, 
    children, 
    onEditClick, 
    stepNumber 
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onEditClick: () => void;
    stepNumber: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="flex items-center gap-1"
        >
          <Edit className="h-3 w-3" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    value ? (
      <div className="flex justify-between py-1">
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{value}</span>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Registration Details</h2>
        <p className="text-muted-foreground">
          Please review all information before submitting
        </p>
      </div>

      <InfoCard
        title="Family Details"
        icon={<Users className="h-5 w-5 text-family-primary" />}
        onEditClick={() => onEdit(1)}
        stepNumber={1}
      >
        <div className="space-y-2">
          <DetailRow label="Head of Family" value={familyDetails.headOfFamily} />
          <DetailRow label="Branch" value={familyDetails.branch} />
        </div>
      </InfoCard>

      <InfoCard
        title="Personal Details"
        icon={<User className="h-5 w-5 text-family-primary" />}
        onEditClick={() => onEdit(2)}
        stepNumber={2}
      >
        <div className="space-y-2">
          <DetailRow label="Member Name" value={personalDetails.memberName} />
          <DetailRow label="Gender" value={personalDetails.gender} />
          <DetailRow label="Date of Birth" value={personalDetails.dateOfBirth} />
          {personalDetails.isDeceased === 'Yes' && personalDetails.dateOfDeath && (
            <DetailRow label="Date of Death" value={personalDetails.dateOfDeath} />
          )}
          {personalDetails.maritalStatus && (
            <DetailRow label="Marital Status" value={personalDetails.maritalStatus} />
          )}
          {personalDetails.spouseName && (
            <DetailRow label="Spouse Name" value={personalDetails.spouseName} />
          )}
          {personalDetails.fatherName && (
            <DetailRow label="Father Name" value={personalDetails.fatherName} />
          )}
          {personalDetails.motherName && (
            <DetailRow label="Mother Name" value={personalDetails.motherName} />
          )}
          
          {personalDetails.numberOfChildren > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Children ({personalDetails.numberOfChildren})</span>
              </div>
              <div className="space-y-1">
                {personalDetails.children.map((child, index) => (
                  child.name && (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{child.name}</span>
                      <Badge variant="outline">{child.gender}</Badge>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {(personalDetails.personalPhoto || personalDetails.familyPhoto) && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4" />
                <span className="font-medium">Photos</span>
              </div>
              <div className="flex gap-4">
                {personalDetails.personalPhoto && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Personal Photo</p>
                    <img
                      src={URL.createObjectURL(personalDetails.personalPhoto)}
                      alt="Personal"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
                {personalDetails.familyPhoto && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Family Photo</p>
                    <img
                      src={URL.createObjectURL(personalDetails.familyPhoto)}
                      alt="Family"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </InfoCard>

      {isAlive && (
        <>
          <InfoCard
            title="Contact Information"
            icon={<Phone className="h-5 w-5 text-family-primary" />}
            onEditClick={() => onEdit(3)}
            stepNumber={3}
          >
            <div className="space-y-2">
              <DetailRow label="Contact Number" value={contactInfo.contactNumber} />
              {contactInfo.whatsappNumber && (
                <DetailRow label="WhatsApp Number" value={contactInfo.whatsappNumber} />
              )}
              {contactInfo.email && (
                <DetailRow label="Email" value={contactInfo.email} />
              )}
              {contactInfo.location && (
                <DetailRow label="Location" value={contactInfo.location} />
              )}
            </div>
          </InfoCard>

          <InfoCard
            title="Employment Information"
            icon={<Briefcase className="h-5 w-5 text-family-primary" />}
            onEditClick={() => onEdit(4)}
            stepNumber={4}
          >
            <div className="space-y-2">
              <DetailRow label="Job Status" value={employment.jobStatus} />
              {employment.jobStatus === 'Working' && (
                <>
                  {employment.companyName && (
                    <DetailRow label="Company Name" value={employment.companyName} />
                  )}
                  {employment.designation && (
                    <DetailRow label="Designation" value={employment.designation} />
                  )}
                  {employment.workLocation && (
                    <DetailRow label="Work Location" value={employment.workLocation} />
                  )}
                </>
              )}
            </div>
          </InfoCard>
        </>
      )}

      {!isAlive && (
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
};