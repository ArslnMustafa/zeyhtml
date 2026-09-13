import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createDateSubmission } from "./db";
import { allowedDateSelections, allowedDateTimes, formatDateRequestNotification, latestSelectableDate } from "./dateSubmission";
import { sendOwnerEmail } from "./email";
import { formatVisitNotification } from "./visitNotification";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  dateRequest: router({
    submit: publicProcedure
      .input(z.object({
        selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(date => date <= latestSelectableDate, { message: "Tarih 30 Ağustos 2026 tarihini geçemez." }),
        selectedTime: z.enum(allowedDateTimes),
        selections: z.array(z.enum(allowedDateSelections)).min(1).max(7),
      }))
      .mutation(async ({ input }) => {
        await createDateSubmission({
          selectedDate: input.selectedDate,
          selectedTime: input.selectedTime,
          selections: JSON.stringify(input.selections),
        });

        let ownerNotified = false;
        let emailSent = false;
        const notificationContent = formatDateRequestNotification(input);
        try {
          ownerNotified = await notifyOwner({
            title: "Yeni bir date planı var!",
            content: notificationContent,
          });
        } catch (error) {
          console.warn("[Date request] The owner notification could not be delivered:", error);
        }

        try {
          emailSent = await sendOwnerEmail({
            subject: "Yeni bir date planı var!",
            text: notificationContent,
          });
        } catch (error) {
          console.warn("[Date request] The email notification could not be delivered:", error);
        }

        return { success: true, ownerNotified, emailSent } as const;
      }),
  }),
  visit: router({
    track: publicProcedure
      .input(z.object({
        page: z.string().min(1).max(80),
      }))
      .mutation(async ({ input }) => {
        let ownerNotified = false;
        let emailSent = false;
        const notificationContent = formatVisitNotification(input.page);
        try {
          ownerNotified = await notifyOwner({
            title: "Date sayfası ziyaret edildi",
            content: notificationContent,
          });
        } catch (error) {
          console.warn("[Visit notification] The owner notification could not be delivered:", error);
        }

        try {
          emailSent = await sendOwnerEmail({
            subject: "Date sayfası ziyaret edildi",
            text: notificationContent,
          });
        } catch (error) {
          console.warn("[Visit notification] The email notification could not be delivered:", error);
        }

        return { success: true, ownerNotified, emailSent } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
