import { Request, RequestHandler, Response } from "express";
import { getContext } from "~/services/session/session-service";
import { ScheduleService } from "../../scheduling/schedule-service";
import { ensureSiteId } from "../../session/session-service";
const handler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const context = getContext(req);
  const actorId = req.params["actor.identifier"] ?? ensureSiteId(context);
  const schedules = ScheduleService.findByActor(context, actorId);
  res.json(schedules);
  res.status(200);
};
export const ScheduleFhirRead = handler;
