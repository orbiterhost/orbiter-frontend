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
}

export type DomainRecordInfo = {
    recordType: string,
    recordHost: string,
    recordValue: string,
  }