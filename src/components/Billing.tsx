import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type PlanDetails = {
  planName: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  status: string;
  nextPlan?: string;
};

type BillingProps = {
  planDetails: PlanDetails;
  selectPlan: (priceId: string) => Promise<void>;
};

type Plan = {
  id: string;
  name: string;
  displayName: string;
  price: number;
  features: string[];
  priceId: string;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "free",
    displayName: "Free",
    price: 0,
    features: [
      "Two projects",
      "25mb file/folder upload limit",
      "500mb storage",
      "1 collaborator",
      "Free orbiter.website subdomain",
    ],
    priceId: "",
  },
  {
    id: "launch",
    name: "launch",
    displayName: "Launch",
    price: 9,
    features: [
      "5 projects",
      "50mb file/folder upload limit",
      "1gb storage",
      "2 collaborators",
      "Custom domain",
      "Remove Orbiter branding",
      "Unlimited traffic",
    ],
    priceId: "price_1QctpDIWMzuw7wjqbK42YN85",
  },
  {
    id: "orbit",
    name: "orbit",
    displayName: "Orbit",
    price: 19,
    features: [
      "Unlimited projects",
      "100mb file/folder upload limit",
      "10gb storage",
      "Unlimited collaborators",
      "Custom domain",
      "Analytics",
      "Remove Orbiter branding",
      "Unlimited traffic",
    ],
    priceId: "price_1QctpbIWMzuw7wjqFHL2L4rl",
  },
];

const Billing = (props: BillingProps) => {
  // Helper to get the display name for a plan
  const getPlanDisplayName = (planName: string) => {
    const plan = PLANS.find(p => p.name === planName);
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
            <p className="text-sm text-yellow-600 text-center">
              Changing to {getPlanDisplayName(props.planDetails.nextPlan)} next period
            </p>
          )}
        </div>
      );
    }

    if (isNextPlan) {
      return (
        <div className="flex flex-col gap-2">
          <Button disabled className="w-full bg-blue-500">
            Starting next period
          </Button>
          <p className="text-sm text-blue-600 text-center">
            Scheduled to start at end of current period
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

  return (
    <div className="sm:max-w-screen-lg max-w-screen-sm w-full mx-auto flex flex-col items-start justify-center gap-2">
      <div className="flex flex-col gap-12 items-center justify-start min-h-screen w-full max-w-screen-lg mx-auto p-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Billing
        </h1>
        <div className="flex sm:flex-row flex-col gap-8 justify-center items-center w-full">
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
                <CardTitle className="text-3xl">{plan.displayName}</CardTitle>
                <CardDescription>${plan.price}/month</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-between gap-4">
                <ul className="list-disc ml-4 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                {getPlanButton(plan)}
              </CardContent>
            </Card>
          ))}
        </div>
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