import React from 'react'
import CSKRetentions2025 from '@/app/Teamdetails/CSK/page';
import DCRetentions2025 from '@/app/Teamdetails/DC/page';
import GTRetentions2025 from '@/app/Teamdetails/GT/page';
import KKRRetentions2025 from '@/app/Teamdetails/KKR/page';
import LSGRetentions2025 from '@/app/Teamdetails/LSG/page';
import MIRetentions2025 from '@/app/Teamdetails/MI/page';
import PBKSRetentions2025 from '@/app/Teamdetails/PBKS/page';
import RCBRetentions2025 from '@/app/Teamdetails/RCB/page';
import RRRetentions2025 from '@/app/Teamdetails/RR/page';
import SRHRetentions2025 from '@/app/Teamdetails/SRH/page';
import { useParams } from 'next/navigation';

const componentMap = {
  CSK: CSKRetentions2025,
  DC: DCRetentions2025,
  GT: GTRetentions2025,
  KKR: KKRRetentions2025,
  LSG: LSGRetentions2025,
  MI: MIRetentions2025,
  PBKS: PBKSRetentions2025,
  RCB: RCBRetentions2025,
  RR: RRRetentions2025,
  SRH: SRHRetentions2025
};

const Rulesandretention = () => {
  const params = useParams();
  const fullParam = params.roomCode || "00000RCB";
  const teamName = fullParam.slice(5);
  const RetentionComponent = componentMap[teamName];

  return (
    <div>
      {RetentionComponent ? <RetentionComponent /> : <div>Invalid team code: {teamName}</div>}
    </div>
  );
};

export default Rulesandretention;
