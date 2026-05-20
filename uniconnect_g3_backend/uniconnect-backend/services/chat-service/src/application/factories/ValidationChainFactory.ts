import { ValidarCamposHandler } from '../validations/ValidarCamposHandler';
import { ValidarTamanoHandler } from '../validations/ValidarTamanoHandler';
import { ValidarPermisosHandler } from '../validations/ValidarPermisosHandler';
import { ValidarContenidoHandler } from '../validations/ValidarContenidoHandler';
import { ValidarMencionesHandler } from '../validations/ValidarMencionesHandler';
import { ValidarPermisosPrivadoHandler } from '../validations/ValidarPermisosPrivadoHandler';
import { ValidarMencionesPrivadoHandler } from '../validations/ValidarMencionesPrivadoHandler';
import { IGroupMemberRepository, IChatRepository } from '../../domain/repositories';
import { BaseHandler } from '../validations/BaseHandler';

export class ValidationChainFactory {
  /**
   * Crea la cadena de validación para mensajes de grupo.
   */
  static createGroupMessageChain(groupMemberRepo: IGroupMemberRepository): BaseHandler {
    const campos = new ValidarCamposHandler();
    const tamano = new ValidarTamanoHandler(2000);
    const permisos = new ValidarPermisosHandler(groupMemberRepo);
    const contenido = new ValidarContenidoHandler();
    const menciones = new ValidarMencionesHandler(groupMemberRepo);

    campos
      .setSiguiente(tamano)
      .setSiguiente(permisos)
      .setSiguiente(contenido)
      .setSiguiente(menciones);

    return campos;
  }

  /**
   * Crea la cadena de validación para mensajes privados (US-W06 C3).
   */
  static createPrivateMessageChain(chatRepo: IChatRepository): BaseHandler {
    const campos = new ValidarCamposHandler();
    const tamano = new ValidarTamanoHandler(2000);
    const permisos = new ValidarPermisosPrivadoHandler(chatRepo);
    const contenido = new ValidarContenidoHandler();
    const menciones = new ValidarMencionesPrivadoHandler(chatRepo);

    campos
      .setSiguiente(tamano)
      .setSiguiente(permisos)
      .setSiguiente(contenido)
      .setSiguiente(menciones);

    return campos;
  }
}
