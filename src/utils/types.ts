export type Site = {
  id: string;
  created_at: string;
  organization_id: string;
  cid: string;
  domain: string;
  site_contract: string;
  updated_at: string;
  deployed_by: string | null;
  custom_domain?: string | null;
  domain_ownership_verified?: boolean | null;
  ssl_issued?: boolean | null;
};

export type DomainRecordInfo = {
  recordType: string;
  recordHost: string;
  recordValue: string;
};

export type Organization = {
  id: string;
  created_at: string;
  name: string;
  owner_id: string;
};

export type Membership = {
    id: string;
    created_at: string;
    role: string;
    user_id: string;
    organization_id: string;
    organizations: Organization;
    user?: {
      id: string, 
      name: string, 
      email: string,
      avatar: string
    }
}

export type Invite = {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  email: string;
  invite_email: string;
  role: string;
  status: string;
  first_name: string;
  last_name: string;
}

export type Template = {
  name: string;
  cid: string;
  previewImageUrl: string;
  hostedUrl: string;
}