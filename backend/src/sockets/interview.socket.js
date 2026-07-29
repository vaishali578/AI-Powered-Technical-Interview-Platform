import InterviewSession from
  "../modules/interviewSessions/session.model.js";
import { executeCode } from "../modules/coding/execution/execution.service.js";

const registerInterviewSocket = (
  io,
  socket
) => {
  socket.on(
    "interview:join",
    async ({
      sessionId,
    }) => {
      try {
        if (!sessionId) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Session ID is required",
            }
          );
        }

        // Find session
        const session =
          await InterviewSession
            .findById(sessionId)
            .select(
              "_id candidate recruiter status"
            );

        if (!session) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview session not found",
            }
          );
        }

        const userId =
          socket.user.id;

        const isCandidate =
          session.candidate
            .toString() ===
          userId;

        const isRecruiter =
          session.recruiter
            .toString() ===
          userId;

        // Authorization check
        if (
          !isCandidate &&
          !isRecruiter
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "You are not authorized to join this interview",
            }
          );
        }

        // Check session status
        if (
          session.status ===
          "COMPLETED" ||
          session.status ===
          "CANCELLED"
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview session is no longer active",
            }
          );
        }

        // Room name
        const roomId =
          `interview:${sessionId}`;

        // Join room
        await socket.join(
          roomId
        );

        console.log(
          `${socket.user.email} joined ${roomId}`
        );

        // Send success to current user
        socket.emit(
          "interview:joined",
          {
            sessionId,
            roomId,
            role:
              isCandidate
                ? "CANDIDATE"
                : "RECRUITER",
          }
        );

        // Notify everyone else
        socket
          .to(roomId)
          .emit(
            "interview:user-joined",
            {
              userId:
                socket.user.id,

              name:
                socket.user.name,

              role:
                isCandidate
                  ? "CANDIDATE"
                  : "RECRUITER",
            }
          );
      } catch (error) {
        console.error(
          "Join interview error:",
          error
        );

        socket.emit(
          "interview:error",
          {
            message:
              "Unable to join interview",
          }
        );
      }
    }
  );

  socket.on(
    "interview:start",
    async ({ sessionId }) => {
      try {
        if (!sessionId) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Session ID is required",
            }
          );
        }

        // Find session
        const session =
          await InterviewSession.findById(
            sessionId
          );

        if (!session) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview session not found",
            }
          );
        }

        // Check recruiter authorization
        const isRecruiter =
          session.recruiter.toString() ===
          socket.user.id;

        if (!isRecruiter) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Only the recruiter can start the interview",
            }
          );
        }

        // Check current status
        if (
          session.status ===
          "COMPLETED"
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview is already completed",
            }
          );
        }

        if (
          session.status ===
          "CANCELLED"
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview is cancelled",
            }
          );
        }

        // Update session
        session.status =
          "IN_PROGRESS";

        session.startedAt =
          new Date();

        session.lastActivityAt =
          new Date();

        await session.save();

        // Room name
        const roomId =
          `interview:${sessionId}`;

        // Notify everyone in room
        io.to(roomId).emit(
          "interview:started",
          {
            sessionId,

            startedAt:
              session.startedAt,

            status:
              session.status,
          }
        );
      } catch (error) {
        console.error(
          "Start interview error:",
          error
        );

        socket.emit(
          "interview:error",
          {
            message:
              "Unable to start interview",
          }
        );
      }
    }
  );

  socket.on(
    "interview:end",
    async ({ sessionId }) => {
      try {
        if (!sessionId) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Session ID is required",
            }
          );
        }

        const session =
          await InterviewSession.findById(
            sessionId
          );

        if (!session) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview session not found",
            }
          );
        }

        // Only recruiter can end
        const isRecruiter =
          session.recruiter.toString() ===
          socket.user.id;

        if (!isRecruiter) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Only the recruiter can end the interview",
            }
          );
        }

        // Check status
        if (
          session.status !==
          "IN_PROGRESS"
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview is not currently in progress",
            }
          );
        }

        // Update session
        session.status =
          "COMPLETED";

        session.endedAt =
          new Date();

        session.lastActivityAt =
          new Date();

        session.currentRound =
          "COMPLETED";

        await session.save();

        const roomId =
          `interview:${sessionId}`;

        // Notify room
        io.to(roomId).emit(
          "interview:ended",
          {
            sessionId,

            status:
              session.status,

            endedAt:
              session.endedAt,
          }
        );
      } catch (error) {
        console.error(
          "End interview error:",
          error
        );

        socket.emit(
          "interview:error",
          {
            message:
              "Unable to end interview",
          }
        );
      }
    }
  );

  socket.on(
    "code:change",
    async ({
      sessionId,
      code,
      language,
    }) => {
      try {
        if (!sessionId) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Session ID is required",
            }
          );
        }

        // Find interview session
        const session =
          await InterviewSession.findById(
            sessionId
          );

        if (!session) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview session not found",
            }
          );
        }

        // Check user authorization
        const isCandidate =
          session.candidate.toString() ===
          socket.user.id;

        const isRecruiter =
          session.recruiter.toString() ===
          socket.user.id;

        if (
          !isCandidate &&
          !isRecruiter
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "You are not authorized for this interview",
            }
          );
        }

        // Interview must be running
        if (
          session.status !==
          "IN_PROGRESS"
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview is not in progress",
            }
          );
        }

        const roomId =
          `interview:${sessionId}`;

        // Get existing state
        const existingState =
          codeStates.get(
            sessionId
          );

        // Save latest code in memory
        codeStates.set(
          sessionId,
          {
            code,
            language:
              language ||
              existingState?.language ||
              "javascript",
          }
        );

        // Send code to everyone
        // except sender
        socket
          .to(roomId)
          .emit(
            "code:updated",
            {
              code,

              language:
                language ||
                existingState?.language ||
                "javascript",

              updatedBy:
                socket.user.id,
            }
          );
      } catch (error) {
        console.error(
          "Code change error:",
          error
        );

        socket.emit(
          "interview:error",
          {
            message:
              "Unable to sync code",
          }
        );
      }
    }
  );

  socket.on(
    "code:sync",
    async ({
      sessionId,
    }) => {
      try {
        if (!sessionId) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Session ID is required",
            }
          );
        }

        // Check session
        const session =
          await InterviewSession.findById(
            sessionId
          );

        if (!session) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview session not found",
            }
          );
        }

        // Check authorization
        const isCandidate =
          session.candidate.toString() ===
          socket.user.id;

        const isRecruiter =
          session.recruiter.toString() ===
          socket.user.id;

        if (
          !isCandidate &&
          !isRecruiter
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "You are not authorized for this interview",
            }
          );
        }

        // Get current code
        const currentState =
          codeStates.get(
            sessionId
          );

        if (!currentState) {
          return socket.emit(
            "code:sync",
            {
              code: "",
              language:
                "javascript",
            }
          );
        }

        // Send current code
        socket.emit(
          "code:sync",
          {
            code:
              currentState.code,

            language:
              currentState.language,
          }
        );
      } catch (error) {
        console.error(
          "Code sync error:",
          error
        );

        socket.emit(
          "interview:error",
          {
            message:
              "Unable to sync code",
          }
        );
      }
    }
  );

  socket.on(
    "language:change",
    async ({
      sessionId,
      language,
    }) => {
      try {
        if (!sessionId) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Session ID is required",
            }
          );
        }

        if (!language) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Programming language is required",
            }
          );
        }

        // Find session
        const session =
          await InterviewSession.findById(
            sessionId
          );

        if (!session) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview session not found",
            }
          );
        }

        // Check authorization
        const isCandidate =
          session.candidate.toString() ===
          socket.user.id;

        const isRecruiter =
          session.recruiter.toString() ===
          socket.user.id;

        if (
          !isCandidate &&
          !isRecruiter
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "You are not authorized for this interview",
            }
          );
        }

        // Interview should be active
        if (
          session.status !==
          "IN_PROGRESS"
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview is not in progress",
            }
          );
        }

        // Get existing code state
        const existingState =
          codeStates.get(
            sessionId
          );

        // Update language
        codeStates.set(
          sessionId,
          {
            code:
              existingState?.code ||
              "",

            language,
          }
        );

        const roomId =
          `interview:${sessionId}`;

        // Notify everyone in room
        io.to(roomId).emit(
          "language:updated",
          {
            sessionId,
            language,
            changedBy:
              socket.user.id,
          }
        );
      } catch (error) {
        console.error(
          "Language change error:",
          error
        );

        socket.emit(
          "interview:error",
          {
            message:
              "Unable to change programming language",
          }
        );
      }
    }
  );

  socket.on(
    "code:execute",
    async ({
      sessionId,
      code,
      language,
      input = "",
    }) => {
      try {
        if (!sessionId) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Session ID is required",
            }
          );
        }

        // Find session
        const session =
          await InterviewSession.findById(
            sessionId
          );

        if (!session) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview session not found",
            }
          );
        }

        // Check authorization
        const isCandidate =
          session.candidate.toString() ===
          socket.user.id;

        const isRecruiter =
          session.recruiter.toString() ===
          socket.user.id;

        if (
          !isCandidate &&
          !isRecruiter
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "You are not authorized for this interview",
            }
          );
        }

        // Check interview status
        if (
          session.status !==
          "IN_PROGRESS"
        ) {
          return socket.emit(
            "interview:error",
            {
              message:
                "Interview is not in progress",
            }
          );
        }

        // Execute code
        const result =
          await executeCode({
            code,
            language,
            input,
          });

        const roomId =
          `interview:${sessionId}`;

        // Send result to everyone
        // in interview room
        io.to(roomId).emit(
          "code:execution-result",
          {
            status:
              result.status,

            output:
              result.output,

            error:
              result.error,

            executionTime:
              result.executionTime,
          }
        );
      } catch (error) {
        console.error(
          "Code execution error:",
          error
        );

        socket.emit(
          "code:execution-result",
          {
            status: "ERROR",

            output: "",

            error:
              "Code execution failed",

            executionTime: 0,
          }
        );
      }
    }
  );
};

export {
  registerInterviewSocket,
};