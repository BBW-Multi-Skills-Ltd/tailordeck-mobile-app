import { CoupleBodyMeasurementCards } from './body-measurements/CoupleBodyMeasurementCards'
import { FamilyBodyMeasurementCards } from './body-measurements/FamilyBodyMeasurementCards'
import { SingleBodyMeasurementCard } from './body-measurements/SingleBodyMeasurementCard'
import type { BodyMeasurementsSectionProps } from './body-measurements/bodyMeasurementsTypes'
import { MeasurementSectionIntro } from './body-measurements/bodyMeasurementUtils'

export default function BodyMeasurementsSection(props: BodyMeasurementsSectionProps) {
  if (props.jobType === 'Single' && props.persons[0]) {
    return (
      <div className="stack gap-8 wizard-step1-measurements">
        <MeasurementSectionIntro />
        <SingleBodyMeasurementCard {...props} />
      </div>
    )
  }

  if (props.jobType === 'Couple') {
    return (
      <div className="stack gap-8 wizard-step1-measurements">
        <MeasurementSectionIntro />
        <CoupleBodyMeasurementCards {...props} />
      </div>
    )
  }

  return (
    <div className="stack gap-8 wizard-step1-measurements">
      <MeasurementSectionIntro />
      <FamilyBodyMeasurementCards {...props} />
    </div>
  )
}
