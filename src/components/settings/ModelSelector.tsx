'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CHAT_MODELS } from '@/lib/constants';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';

export function ModelSelector() {
  const { defaultModel, setDefaultModel } = useSettingsStore();
  const { getCurrentConversation, updateConversation } = useChatStore();
  const conversation = getCurrentConversation();

  const currentModel = conversation?.model || defaultModel;

  const handleModelChange = (value: string) => {
    if (conversation) {
      updateConversation(conversation.id, { model: value });
    } else {
      setDefaultModel(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Model</label>
      <Select value={currentModel} onValueChange={handleModelChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CHAT_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div>
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-muted-foreground">{model.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
