import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';
import { ContactInfo, StepProps } from '../types';

interface ContactInfoStepProps extends StepProps {
  data: ContactInfo;
}

export const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  data,
  onChange,
}) => {
  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-family-primary" />
            Contact Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This information will help family members stay connected
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              type="tel"
              value={data.contactNumber}
              onChange={e => handleInputChange('contactNumber', e.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              value={data.whatsappNumber}
              onChange={e =>
                handleInputChange('whatsappNumber', e.target.value)
              }
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              Location
            </Label>
            <Input
              id="location"
              value={data.location}
              onChange={e => handleInputChange('location', e.target.value)}
              placeholder="City, State, Country"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
