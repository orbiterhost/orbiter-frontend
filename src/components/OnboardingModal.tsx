import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OnboardingQuestion, OnboardingResponse } from "@/utils/types";
import { Session } from "@supabase/supabase-js";
import { updateOnboardingResponses } from "@/utils/db";

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

const OnboardingSurveyModal = ({ userSession }: { userSession: Session }) => {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<OnboardingResponse>({
    referral_source: "",
    site_types: "",
    technical_experience: "",
    previous_platform: "",
  });
  
  // Store the original questions
  const originalQuestions: OnboardingQuestion[] = [
    {
      id: "referral_source",
      question: "How did you hear about us?",
      options: [
        "Google",
        "AI/LLM Chatbots",
        "Farcaster",
        "Twitter",
        "Bluesky",
        "Other",
      ],
    },
    {
      id: "site_types",
      question: "What types of sites will you host?",
      options: ["Web apps", "Personal site", "Ecommerce", "Mini Apps", "Other"],
    },
    {
      id: "technical_experience",
      question: "What is your technical experience?",
      options: [
        "Experienced developer",
        "Novice developer",
        "Vibe coder",
        "No real technical experience",
      ],
    },
    {
      id: "previous_platform",
      question: "Which previous hosting platform have you used the most?",
      options: ["Vercel", "Netlify", "AWS", "Google Cloud", "Heroku", "Other"],
    },
  ];
  
  // State to hold shuffled questions
  const [shuffledQuestions, setShuffledQuestions] = useState<OnboardingQuestion[]>([]);
  
  // Shuffle options for each question on component mount
  useEffect(() => {
    const questionsWithShuffledOptions = originalQuestions.map(question => ({
      ...question,
      options: shuffleArray(question.options)
    }));
    
    setShuffledQuestions(questionsWithShuffledOptions);
  }, []);

  const handleOptionSelect = (value: string) => {
    const currentQuestion = shuffledQuestions[currentStep];
    setResponses({
      ...responses,
      [currentQuestion.id]: value,
    });
  };

  const goToNextStep = () => {
    if (currentStep < shuffledQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitResponses();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitResponses = async () => {
    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...responses,
        user_id: userSession.user.id
      };

      await updateOnboardingResponses(dataToSubmit);

      setOpen(false);
    } catch (error) {
      console.error("Error submitting survey:", error);
      // Handle error - could show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if questions are loaded
  if (shuffledQuestions.length === 0) {
    return null; // Or render a loading state
  }

  // Get current question data
  const currentQuestion: OnboardingQuestion = shuffledQuestions[currentStep];
  const currentResponse =
    responses[currentQuestion.id as keyof OnboardingResponse];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Welcome! Help us get to know you
          </DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {shuffledQuestions.length}
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                {currentQuestion.question}
              </h3>

              <RadioGroup
                value={currentResponse}
                onValueChange={handleOptionSelect}
                className="gap-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          <Button
            onClick={goToNextStep}
            disabled={!currentResponse || isSubmitting}
          >
            {currentStep < shuffledQuestions.length - 1 ? "Next" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSurveyModal;