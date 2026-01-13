import { View, Text } from '@tarojs/components'
import './index.scss'

interface Step {
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export default function StepIndicator({
  steps,
  currentStep,
  className = ''
}: StepIndicatorProps) {
  return (
    <View className={`step-indicator ${className}`}>
      <View className="step-indicator__progress">
        {steps.map((step, index) => (
          <View key={index} className="step-indicator__item">
            <View
              className={`step-indicator__dot ${
                index < currentStep ? 'completed' : ''
              } ${index === currentStep ? 'active' : ''}`}
            >
              {index < currentStep ? (
                <Text className="step-indicator__check">✓</Text>
              ) : (
                <Text className="step-indicator__number">{index + 1}</Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View
                className={`step-indicator__line ${
                  index < currentStep ? 'completed' : ''
                }`}
              />
            )}
          </View>
        ))}
      </View>

      <View className="step-indicator__labels">
        {steps.map((step, index) => (
          <Text
            key={index}
            className={`step-indicator__label ${
              index === currentStep ? 'active' : ''
            } ${index < currentStep ? 'completed' : ''}`}
          >
            {step.label}
          </Text>
        ))}
      </View>
    </View>
  )
}
