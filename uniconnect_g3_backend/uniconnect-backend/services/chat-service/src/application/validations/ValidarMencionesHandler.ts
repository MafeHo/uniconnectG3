import { BaseHandler, ValidationRequest, ValidationResult } from './BaseHandler';
import { IGroupMemberRepository } from '../../domain/repositories';

export class ValidarMencionesHandler extends BaseHandler {
  private groupMemberRepo: IGroupMemberRepository;

  constructor(groupMemberRepo: IGroupMemberRepository) {
    super();
    this.groupMemberRepo = groupMemberRepo;
  }

  async manejar(request: ValidationRequest): Promise<ValidationResult> {
    const { text, groupId } = request;

    if (!text) {
      request.mentions = [];
      return await super.manejar(request);
    }

    const mentionRegex = /@(\w+)/g;
    const matches = [...text.matchAll(mentionRegex)];

    if (matches.length === 0) {
      request.mentions = [];
      return await super.manejar(request);
    }

    try {
      if (groupId) {
        const allMembers = await this.groupMemberRepo.getGroupMembersWithNames(groupId);
        const mentionedUserIds: string[] = [];
        let renderedText = text;

        for (const match of matches) {
          const potentialName = match[1].toLowerCase().trim();
          const foundMember = allMembers.find(member =>
            member.name && member.name.toLowerCase().includes(potentialName)
          );

          if (foundMember) {
            if (!mentionedUserIds.includes(foundMember.id)) {
              mentionedUserIds.push(foundMember.id);
            }
            renderedText = renderedText.replace(match[0], `<span class="mention">@${foundMember.name}</span>`);
          }
        }

        request.mentions = mentionedUserIds;
        request.renderedText = renderedText;
      } else {
        request.mentions = [];
        request.renderedText = text;
      }
    } catch (error) {
      console.error('[ValidarMencionesHandler] Error detectando menciones:', error);
      request.mentions = [];
      request.renderedText = text;
    }

    return await super.manejar(request);
  }
}
