export interface FeedbackSummary {
  averageOverallRating: number;
  averageContentRating: number;
  averageOrganizationRating: number;
  averagePresenterRating: number;
  totalFeedbacks: number;
}

export interface PhotoWithDescription {
  url: string;
  description: string;
}