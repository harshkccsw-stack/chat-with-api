'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { PARAMETER_PRESETS } from '@/lib/constants';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';

export function ParametersPanel() {
  const { parameters, updateParameters, resetParameters } = useSettingsStore();
  const { getCurrentConversation, updateConversation } = useChatStore();
  const conversation = getCurrentConversation();

  const currentParams = conversation?.parameters || parameters;

  const handleParamChange = (key: string, value: number) => {
    const updates = { [key]: value };
    if (conversation) {
      updateConversation(conversation.id, { parameters: { ...currentParams, ...updates } });
    } else {
      updateParameters(updates);
    }
  };

  const handlePreset = (preset: 'creative' | 'balanced' | 'precise') => {
    const params = PARAMETER_PRESETS[preset];
    if (conversation) {
      updateConversation(conversation.id, { parameters: params });
    } else {
      updateParameters(params);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Presets</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePreset('creative')}>
            Creative
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePreset('balanced')}>
            Balanced
          </Button>
          <Button variant="outline" size="sm" onClick={() => handlePreset('precise')}>
            Precise
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Temperature</label>
            <span className="text-sm text-muted-foreground">{currentParams.temperature}</span>
          </div>
          <Slider
            value={[currentParams.temperature]}
            onValueChange={([value]) => handleParamChange('temperature', value)}
            min={0}
            max={2}
            step={0.1}
          />
          <p className="text-xs text-muted-foreground mt-1">Higher values make output more random</p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Max Tokens</label>
            <Input
              type="number"
              value={currentParams.maxTokens}
              onChange={(e) => handleParamChange('maxTokens', parseInt(e.target.value))}
              className="w-20 h-8"
            />
          </div>
          <p className="text-xs text-muted-foreground">Maximum length of response</p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Top P</label>
            <span className="text-sm text-muted-foreground">{currentParams.topP}</span>
          </div>
          <Slider
            value={[currentParams.topP]}
            onValueChange={([value]) => handleParamChange('topP', value)}
            min={0}
            max={1}
            step={0.05}
          />
          <p className="text-xs text-muted-foreground mt-1">Nucleus sampling threshold</p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Frequency Penalty</label>
            <span className="text-sm text-muted-foreground">{currentParams.frequencyPenalty}</span>
          </div>
          <Slider
            value={[currentParams.frequencyPenalty]}
            onValueChange={([value]) => handleParamChange('frequencyPenalty', value)}
            min={-2}
            max={2}
            step={0.1}
          />
          <p className="text-xs text-muted-foreground mt-1">Reduce repetition of frequent tokens</p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Presence Penalty</label>
            <span className="text-sm text-muted-foreground">{currentParams.presencePenalty}</span>
          </div>
          <Slider
            value={[currentParams.presencePenalty]}
            onValueChange={([value]) => handleParamChange('presencePenalty', value)}
            min={-2}
            max={2}
            step={0.1}
          />
          <p className="text-xs text-muted-foreground mt-1">Encourage talking about new topics</p>
        </div>
      </div>

      <Button variant="outline" onClick={resetParameters} className="w-full">
        Reset to Defaults
      </Button>
    </div>
  );
}
