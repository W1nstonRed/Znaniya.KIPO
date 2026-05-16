import {
  Controller,
  Post,
  Body,
  HttpCode,
  Req,
  UseGuards,
} from "@nestjs/common";
import { PushService } from "./push.service";
import { SubscribeDto, UnsubscribeDto } from "./dto/subscribe.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

interface AuthRequest extends Request {
  user: { id: string };
}

@Controller("push")
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post("subscribe")
  @HttpCode(200)
  subscribe(@Req() req: AuthRequest, @Body() dto: SubscribeDto) {
    return this.pushService.subscribe(req.user.id, dto);
  }

  @Post("unsubscribe")
  @HttpCode(200)
  unsubscribe(@Req() req: AuthRequest, @Body() dto: UnsubscribeDto) {
    return this.pushService.unsubscribe(req.user.id, dto.endpoint);
  }

  @Post("test")
  @HttpCode(200)
  async test() {
    await this.pushService.sendToAll("Тест", "Это тестовое уведомление", "/");
    return { ok: true };
  }
}
