import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { PlanDetails } from "@/App";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Session } from "@supabase/supabase-js";
import { Organization } from "@/utils/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type BillingProps = {
  planDetails: PlanDetails;
  selectPlan: (priceId: string) => Promise<void>;
  userSession: Session;
  selectedOrganization: Organization | null;
};

type Plan = {
  id: string;
  name: string;
  displayName: string;
  price: number;
  features: string[];
  priceId: string;
};

const ANNAUL_PLANS: Plan[] = [
  {
    id: "free",
    name: "free",
    displayName: "Free",
    price: 0,
    features: [
      "2 Projects",     
      "1 Collaborator",
      "Free orbiter.website Subdomain",
    ],
    priceId: "",
  },
  {
    id: "launch",
    name: "launch",
    displayName: "Launch",
    price: 84,
    features: [
      "5 Projects",      
      "2 Collaborators",
      "Custom Domains",
      "Remove Orbiter Branding",
      "Unlimited Traffic",
    ],
    priceId: "price_1Qr35mITCuQY0tuKHKHF1z1L",
  },
  {
    id: "orbit",
    name: "orbit",
    displayName: "Orbit",
    price: 192,
    features: [
      "Unlimited Projects",      
      "Unlimited Collaborators",
      "Custom Domains",
      "Analytics (coming soon)",
      "Remove Orbiter Branding",
      "Unlimited Traffic",
    ],
    priceId: "price_1Qr3LjITCuQY0tuKi4etDDN5",
  },
];

const PLANS: Plan[] = [
  {
    id: "free",
    name: "free",
    displayName: "Free",
    price: 0,
    features: [
      "2 Projects",
      "25MB File/Folder Upload Limit",
      "500MB Storage",
      "1 Collaborator",
      "Free orbiter.website Subdomain",
    ],
    priceId: "",
  },
  {
    id: "launch",
    name: "launch",
    displayName: "Launch",
    price: 9,
    features: [
      "5 Projects",
      "50MB File/Folder Upload Limit",
      "1GB Storage",
      "2 Collaborators",
      "Custom Domains",
      "Remove Orbiter Branding",
      "Unlimited Traffic",
    ],
    priceId: "price_1Qfs6PITCuQY0tuKiHEePgmP", //"price_1QctpDIWMzuw7wjqbK42YN85",
  },
  {
    id: "orbit",
    name: "orbit",
    displayName: "Orbit",
    price: 19,
    features: [
      "Unlimited Projects",
      "100MB File/Folder Upload Limit",
      "10GB Storage",
      "Unlimited Collaborators",
      "Custom Domains",
      "Analytics (coming soon)",
      "Remove Orbiter Branding",
      "Unlimited Traffic",
    ],
    priceId: "price_1Qfs5cITCuQY0tuK2Mx2OkPR", //"price_1QctpbIWMzuw7wjqFHL2L4rl",
  },
];

const Billing = (props: BillingProps) => {
  // Helper to get the display name for a plan
  const getPlanDisplayName = (planName: string) => {
    const plan = PLANS.find((p) => p.name === planName);
    return plan?.displayName || planName;
  };

  const getPlanButton = (plan: Plan) => {
    const isCurrentPlan = props.planDetails.planName === plan.name;
    const isNextPlan = props.planDetails.nextPlan === plan.name;

    if (isCurrentPlan) {
      return (
        <div className="flex flex-col gap-2">
          <Button disabled className="w-full">
            Current plan
          </Button>
          {props.planDetails.status === "canceling" && (
            <p className="text-sm text-red-600 text-center">
              Cancels at end of billing period
            </p>
          )}
          {props.planDetails.nextPlan && (
            <p className="text-sm text-gray-400 text-center">
              Changing to {getPlanDisplayName(props.planDetails.nextPlan)} next
              period
            </p>
          )}
        </div>
      );
    }

    if (isNextPlan) {
      return (
        <div className="flex flex-col gap-2">
          <Button disabled className="w-full bg-blue-500">
            Next Billing Cycle
          </Button>
          <p className="text-sm text-blue-600 text-center">
            Scheduled to start at end of current billing period
          </p>
        </div>
      );
    }

    return (
      <Button onClick={() => props.selectPlan(plan.priceId)} className="w-full">
        Select
      </Button>
    );
  };

  const buildLoopLink = (plan: Plan) => {
    const user = props.userSession.user;
    if (plan.name === "launch") {
      return (window.location.href = `https://checkout.loopcrypto.xyz/156ca739-2681-4bfe-a518-f092db09a6d4/15eb156f-0a34-44a5-b897-04b534d44f6a?email=${encodeURI(
        user?.email || ""
      )}&refId=${props?.selectedOrganization?.id}`);
    } else if (plan.name === "orbiter") {
      return (window.location.href = `https://checkout.loopcrypto.xyz/156ca739-2681-4bfe-a518-f092db09a6d4/eb640acc-664e-42f5-8708-66ef1201411e?email=${encodeURI(
        user?.email || ""
      )}&refId=${props?.selectedOrganization?.id}`);
    }
  };

  return (
    <div className="sm:max-w-screen-lg max-w-screen-sm w-full mx-auto flex flex-col items-start justify-center gap-2">
      <div className="flex flex-col gap-12 items-center justify-start min-h-screen w-full max-w-screen-lg mx-auto p-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Billing
        </h1>
        <Tabs defaultValue="yearly" className="w-full">
          <TabsList>
            <TabsTrigger value="yearly">Yearly (save 15%)</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="yearly">
            <div className="flex lg:flex-row flex-col gap-8 justify-center items-center lg:items-start w-full">
              {ANNAUL_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`w-[300px] ${
                    props.planDetails.planName === plan.name
                      ? "border-2 border-gray-400"
                      : props.planDetails.nextPlan === plan.name
                      ? "border-2 border-blue-400"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-3xl">
                      {plan.displayName}
                    </CardTitle>
                    <CardDescription>${plan.price}/year</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between gap-4">
                    <ul className="list-disc ml-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    {getPlanButton(plan)}
                    {plan.name !== "free" && (
                      <Collapsible className="text-center">
                        <CollapsibleTrigger>
                          <p className="text-gray-500 text-sm text-center underline">
                            More payment options
                          </p>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Button
                            variant="link"
                            onClick={() => buildLoopLink(plan)}
                          >
                            Pay with crypto
                          </Button>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="monthly">
            <div className="flex lg:flex-row flex-col gap-8 justify-center items-center lg:items-start w-full">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`w-[300px] ${
                    props.planDetails.planName === plan.name
                      ? "border-2 border-gray-400"
                      : props.planDetails.nextPlan === plan.name
                      ? "border-2 border-blue-400"
                      : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-3xl">
                      {plan.displayName}
                    </CardTitle>
                    <CardDescription>${plan.price}/month</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between gap-4">
                    <ul className="list-disc ml-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    {getPlanButton(plan)}
                    {plan.name !== "free" && (
                      <Collapsible className="text-center">
                        <CollapsibleTrigger>
                          <p className="text-gray-500 text-sm text-center underline">
                            More payment options
                          </p>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Button
                            variant="link"
                            onClick={() => buildLoopLink(plan)}
                          >
                            Pay with crypto
                          </Button>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        {props.planDetails.planName !== "free" && (
          <div>
            <Button onClick={() => props.selectPlan("")}>
              Manage Billing Info
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
