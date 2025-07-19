import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import { DashboardFrigorificos } from '../../components/monitoramento/dashboardQuantidades/dashBoardQuantidades';
import DashBoardRealTime from '../../components/monitoramento/dashboardRealTime/dashBoardRealTime';

export const Carousel = () => {
  return (
    <div className="w-full bg-background text-white">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 30000,
          disableOnInteraction: false
        }}
        loop={true}
        spaceBetween={0}
        slidesPerView={1}
        className="w-full"
      >
        <SwiperSlide className="w-full bg-card-bg overflow-hidden">
          <DashboardFrigorificos />
        </SwiperSlide>

        <SwiperSlide className="w-full bg-card-bg overflow-hidden">
          <DashBoardRealTime />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};
