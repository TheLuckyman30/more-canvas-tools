import { AssignmentQlOut } from "~src/canvas/interfaces";
import { mutationFetcher } from "~src/helpers/fetch";
import { buildReminderInput } from "~src/helpers/reminder-helpers";

const REMINDER_BUTTON_HTML = `
<div id="mct-grader-reminder" 
    style="background-color: white; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer;">
    Set Reminder
</div>
`;

export function injectAddReminder(target: HTMLElement) {
  const observer = new MutationObserver(async () => {
    if (target) {
      observer.disconnect();

      const topMenu = $('span[data-testid="student-navigation-container"]');
      const courseName = $('span[data-testid="course-link-text"]').text();
      const assignmentName = $('a[data-testid="assignment-link"]').text();

      // Change top bar to a flexbox so it can contain the new reminder button
      $(topMenu).css({ display: "flex", "align-items": "center", gap: "20px" });
      $(topMenu).append(REMINDER_BUTTON_HTML);

      const urlParams = new URLSearchParams(window.location.search);
      const assignmentId = urlParams.get("assignment_id");
      const graphQLBody = {
        query:
          "query SpeedGrader_AssignmentQuery($assignmentId: ID!, $includeTypes: [AssignmentTypeEnum!] = [ASSIGNMENT, PEER_REVIEW_SUB_ASSIGNMENT]) {\n  assignment(id: $assignmentId, includeTypes: $includeTypes) {\n    allowedAttempts\n    anonymizeStudents\n    anonymousGrading\n    anonymousStudentIdentities {\n      anonymousId\n      name\n      position\n    }\n    gradingType\n    id\n    _id\n    name\n    pointsPossible\n    gradeAsGroup\n    graderIdentitiesConnection(first: 100) {\n      nodes {\n        anonymousId\n        name\n        position\n      }\n    }\n    gradesPublished\n    gradesPublishedAt\n    gradingPeriodId\n    gradingRole\n    groupAssignment: hasGroupCategory\n    groupCategoryId\n    hasPlagiarismTool\n    htmlUrl\n    parentAssignmentId\n    isNewQuiz\n    supportsGradeByQuestion\n    gradeByQuestionEnabled\n    hasMultipleDueDates\n    moderatedGrading {\n      enabled\n      finalGraderAnonymousId\n    }\n    provisionalGradingLocked\n    rubricUpdateUrl\n    course {\n      id: _id\n      name\n    }\n    checkpoints {\n      pointsPossible\n      tag\n    }\n    discussion {\n      _id\n      contextType\n      contextId\n    }\n    rubric {\n      id: _id\n      freeFormCriterionComments\n      ratingOrder\n      title\n      pointsPossible\n      criteriaCount\n      buttonDisplay\n      ratingOrder\n      workflowState\n      hasRubricAssociations\n      criteria {\n        id: _id\n        criterionUseRange\n        description\n        longDescription\n        ignoreForScoring\n        masteryPoints\n        points\n        learningOutcomeId\n        ratings {\n          id: _id\n          description\n          longDescription\n          points\n        }\n        outcome {\n          displayName\n          title\n        }\n      }\n    }\n    rubricAssociation {\n      id: _id\n      hideOutcomeResults\n      hideScoreTotal\n      useForGrading\n      savedComments\n      hidePoints\n    }\n    quiz {\n      anonymousSubmissions\n    }\n    autoGradeAssignmentIssues {\n      level\n      message\n    }\n  }\n}",
        variables: {
          assignmentId,
        },
        operationName: "SpeedGrader_AssignmentQuery",
      };

      const response = await mutationFetcher<
        typeof graphQLBody,
        AssignmentQlOut
      >({
        endpoint: "https://canvas.instructure.com/api/graphql",
        method: "POST",
        body: graphQLBody,
      });
      const qlAssignmentId = response.data.assignment.id;

      $("div#mct-grader-reminder").on("click", () => {
        buildReminderInput({
          createOpts: { assignmentName, courseName, qlAssignmentId },
        });
      });
    }
  });
  observer.observe($("body")[0], { childList: true, subtree: true });
}
