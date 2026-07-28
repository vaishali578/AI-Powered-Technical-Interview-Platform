import InterviewSession from
  "../modules/interviewSessions/session.model.js";

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
};

export {
  registerInterviewSocket,
};