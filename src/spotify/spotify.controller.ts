import { Controller, Get, Query, Res } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { Response } from 'express';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('/login')
  login(@Res() res: Response) {
    return res.redirect(this.spotifyService.getAuthUrl());
  }

  @Get('/callback')
  callback(@Res() res: Response, @Query('code') code: string) {
    this.spotifyService.setAuthCode(code);
    return res.redirect('https://open.spotify.com/queue');
  }
}
