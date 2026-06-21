import { Injectable } from '@nestjs/common';
import {
  IAiEngine,
  BusinessContext,
  BlogResult,
  PromotionResult,
  WhatsappResult,
  BannerResult,
} from '../../domain/interfaces/ai-engine.interface';

// ─── Utilidades ─────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80);
}

function interpolate(template: string, ctx: BusinessContext): string {
  return template
    .replace(/\[negocio\]/g, ctx.businessName)
    .replace(/\[tipo\]/g, ctx.businessType)
    .replace(/\[ciudad\]/g, ctx.city)
    .replace(/\[objetivo\]/g, ctx.marketingGoal)
    .replace(/\[tono\]/g, ctx.tone)
    .replace(/\[promo\]/g, ctx.activePromotion ?? 'oferta especial')
    .replace(/\[productos\]/g, ctx.featuredProducts ?? 'nuestros productos');
}

// ─── Plantillas de Blog (15 variantes) ──────────────────────────────────────

const BLOG_TITLES = [
  '[negocio]: La mejor opción de [tipo] en [ciudad] este [año]',
  '5 razones para elegir [negocio] en [ciudad]',
  'Cómo [negocio] está transformando el [tipo] en [ciudad]',
  'Todo lo que necesitas saber sobre [negocio] — La guía definitiva',
  'Por qué los clientes de [negocio] vuelven una y otra vez',
  '[negocio] te presenta: [productos] al alcance de todos en [ciudad]',
  'Descubre por qué [negocio] es el favorito del [tipo] en [ciudad]',
  'La historia detrás de [negocio]: calidad y confianza en [ciudad]',
  '[negocio] lanza lo que tu negocio en [ciudad] estaba esperando',
  'Los secretos del éxito de [negocio] en el mercado de [ciudad]',
  '[tipo] en [ciudad]: ¿Por qué [negocio] marca la diferencia?',
  'De [ciudad] para el mundo: cómo [negocio] conquista a sus clientes',
  '[negocio] y su compromiso con la calidad en [ciudad]',
  'Novedades en [negocio]: lo mejor en [tipo] para [ciudad]',
  '[negocio]: Experiencias que van más allá de lo ordinario en [ciudad]',
];

const BLOG_EXCERPTS = [
  'En [negocio] sabemos que cada cliente merece lo mejor. Descubre cómo combinamos calidad, servicio y experiencia para ofrecerte algo verdaderamente especial en [ciudad].',
  'Cuando se trata de [tipo] en [ciudad], [negocio] ha establecido un nuevo estándar. Conoce nuestra propuesta de valor y por qué miles de clientes nos eligen.',
  '[negocio] nació con una misión clara: brindar la mejor experiencia de [tipo] en [ciudad]. Hoy te contamos cómo lo logramos cada día.',
  'Si buscas [productos] de calidad en [ciudad], llegaste al lugar indicado. [negocio] te ofrece una experiencia que supera expectativas.',
  'El mercado de [tipo] en [ciudad] cambió para siempre con la llegada de [negocio]. Descubre nuestra oferta única y únete a nuestra comunidad de clientes satisfechos.',
];

const BLOG_PARAGRAPHS = [
  [
    'En [negocio] entendemos que nuestros clientes en [ciudad] merecen la mejor experiencia posible. Por eso hemos dedicado cada esfuerzo a perfeccionar nuestro servicio de [tipo], combinando tradición con innovación para ofrecerte algo verdaderamente único.',
    'Nuestro equipo trabaja con pasión y compromiso para que cada visita, cada compra y cada interacción con [negocio] sea memorable. Creemos que la excelencia no es un destino, sino un camino que recorremos juntos con nuestros clientes.',
    'Con [productos] como parte de nuestra propuesta, hemos logrado conquistar el corazón de [ciudad]. Cada producto, cada servicio y cada detalle está pensado para superar tus expectativas y hacer de [negocio] tu primera opción.',
    'La confianza de nuestros clientes es nuestro mayor activo. Es por eso que en [negocio] no solo ofrecemos [tipo] de calidad, sino también una experiencia de atención personalizada que te hace sentir especial desde el primer momento.',
    'Si todavía no nos conoces, te invitamos a descubrir todo lo que [negocio] tiene para ofrecerte en [ciudad]. Si ya eres parte de nuestra familia, gracias por tu preferencia. En ambos casos, siempre habrá algo nuevo y emocionante esperándote aquí.',
  ],
  [
    'Cuando fundamos [negocio], teníamos una visión clara: convertirnos en el referente de [tipo] en [ciudad]. Hoy, después de mucho trabajo y dedicación, podemos decir con orgullo que esa visión se ha hecho realidad.',
    'La clave de nuestro éxito está en escuchar a nuestros clientes. Cada sugerencia, cada comentario y cada necesidad que nos comparten se convierte en una oportunidad para mejorar y ofrecer soluciones más efectivas.',
    'Nuestro catálogo incluye [productos], cuidadosamente seleccionados para garantizar la máxima calidad y satisfacción. Cada elemento de nuestra oferta pasa por rigurosos estándares de control que nos permiten garantizar tu satisfacción.',
    'En [negocio] creemos que la tecnología y la tradición pueden coexistir perfectamente. Por eso combinamos las mejores prácticas del [tipo] con herramientas modernas que nos permiten servirte mejor y más eficientemente.',
    'Te invitamos a ser parte de la historia de [negocio] en [ciudad]. Visítanos, conoce nuestra oferta y permite que demostremos por qué somos la mejor opción para ti y tu familia. ¡Te esperamos!',
  ],
  [
    '[negocio] llegó a [ciudad] con una propuesta diferente: poner al cliente en el centro de todo. Desde nuestros inicios, hemos trabajado incansablemente para crear experiencias de [tipo] que van más allá de lo convencional.',
    'La diversidad de nuestra oferta es uno de nuestros mayores orgullos. Con [productos] disponibles para todos los gustos y necesidades, en [negocio] encontrarás exactamente lo que buscas, con la calidad que mereces.',
    'Nuestro compromiso con la comunidad de [ciudad] va más allá del negocio. Participamos activamente en el desarrollo local, apoyamos iniciativas comunitarias y creemos firmemente que el éxito compartido es el único éxito verdadero.',
    'La innovación constante es parte de nuestro ADN en [negocio]. Nos mantenemos a la vanguardia de las tendencias del [tipo] para ofrecerte siempre lo más nuevo, lo más relevante y lo más valioso.',
    'Gracias por considerar a [negocio] como tu opción de [tipo] en [ciudad]. Estamos aquí para servirte con la calidad, el compromiso y la calidez que nuestra comunidad merece. ¡No esperes más para vivir la experiencia [negocio]!',
  ],
];

const META_DESCRIPTIONS = [
  '[negocio] es tu mejor opción de [tipo] en [ciudad]. Descubre [productos] con calidad garantizada, atención personalizada y precios competitivos. ¡Visítanos hoy!',
  'Conoce [negocio], el líder en [tipo] en [ciudad]. Ofrecemos [productos] con los más altos estándares de calidad. Tu satisfacción es nuestra prioridad.',
  '¿Buscas [tipo] de calidad en [ciudad]? [negocio] te ofrece [productos] con servicio excepcional. Descubre por qué somos la primera elección de miles de clientes.',
  'En [negocio] encontrarás todo lo que necesitas en [tipo] en [ciudad]. [productos] de primera calidad, atención profesional y la mejor experiencia del mercado.',
];

// ─── Plantillas de Promoción (10 variantes) ──────────────────────────────────

const PROMO_TEMPLATES = [
  {
    title: '¡Oferta Exclusiva en [negocio]!',
    description:
      'Aprovecha nuestra promoción especial y disfruta de [productos] con un descuento increíble. Esta oferta es por tiempo limitado, exclusiva para nuestros clientes en [ciudad]. ¡No dejes pasar esta oportunidad única!',
    discountRange: [15, 25] as [number, number],
    cta: '¡Aprovecha ahora!',
  },
  {
    title: 'Descuento de Temporada — [negocio]',
    description:
      'Celebra esta temporada con nosotros. En [negocio] hemos preparado una oferta especial en [productos] para que disfrutes al máximo sin preocuparte por el presupuesto. Solo disponible en [ciudad].',
    discountRange: [20, 30] as [number, number],
    cta: '¡Quiero mi descuento!',
  },
  {
    title: '[negocio]: Precio Especial esta Semana',
    description:
      'Esta semana en [negocio] tienes la oportunidad de acceder a [productos] a un precio que no volverás a ver. Válido para clientes en [ciudad] mientras dure el stock. ¡Actúa rápido!',
    discountRange: [10, 20] as [number, number],
    cta: 'Ver oferta completa',
  },
  {
    title: 'Promoción Flash — Solo en [negocio]',
    description:
      '24 horas de precios especiales en [negocio]. Consigue [productos] con descuento directo, sin condiciones y sin complicaciones. La mejor oferta que encontrarás en [ciudad] hoy.',
    discountRange: [25, 40] as [number, number],
    cta: '¡Comprar ahora!',
  },
  {
    title: 'Oferta de Bienvenida — [negocio]',
    description:
      'Si eres nuevo cliente de [negocio] en [ciudad], tenemos un regalo especial para ti. Disfruta de [productos] con descuento exclusivo en tu primera compra. ¡Bienvenido a la familia [negocio]!',
    discountRange: [15, 25] as [number, number],
    cta: '¡Unirme ahora!',
  },
  {
    title: 'Combo Especial — Más por Menos en [negocio]',
    description:
      'En [negocio] creemos que todos merecen más. Por eso hemos creado combos especiales con [productos] que te dan mayor valor por tu inversión. Disponible solo en [ciudad].',
    discountRange: [20, 35] as [number, number],
    cta: 'Ver combos disponibles',
  },
  {
    title: '[negocio] Celebra con Descuentos',
    description:
      'Cada mes es un motivo para celebrar en [negocio]. Este mes, celebramos contigo ofreciéndote [productos] con precios especiales que no encontrarás en ningún otro lugar de [ciudad].',
    discountRange: [15, 30] as [number, number],
    cta: '¡Celebrar y ahorrar!',
  },
  {
    title: 'Liquidación Especial — [negocio]',
    description:
      'Para dar paso a lo nuevo, en [negocio] hemos bajado los precios de [productos] seleccionados. Precios de liquidación por tiempo muy limitado para nuestros clientes de [ciudad].',
    discountRange: [30, 50] as [number, number],
    cta: '¡Ver productos en liquidación!',
  },
  {
    title: 'Descuento por Lealtad — [negocio] te Premia',
    description:
      'En [negocio] valoramos tu fidelidad. Como agradecimiento a nuestros clientes frecuentes de [ciudad], te ofrecemos un descuento especial en [productos]. ¡Gracias por elegirnos!',
    discountRange: [10, 20] as [number, number],
    cta: 'Reclamar mi premio',
  },
  {
    title: 'Acceso Anticipado — Nuevos Productos en [negocio]',
    description:
      'Sé el primero en disfrutar de nuestros nuevos [productos] en [ciudad]. Clientes selectos de [negocio] tienen acceso anticipado con precio especial de lanzamiento.',
    discountRange: [10, 25] as [number, number],
    cta: '¡Quiero acceso anticipado!',
  },
];

// ─── Plantillas de WhatsApp (12 variantes por mensaje) ───────────────────────

const WA_PROMOTIONAL = [
  '🎉 *[negocio]* tiene algo especial para ti. [promo] — ¡Solo por tiempo limitado en [ciudad]! Contáctanos ahora 👇',
  '🔥 ¡OFERTA FLASH en [negocio]! [promo] 🎁 No te lo pierdas. Válido hasta agotar existencias en [ciudad]. ¡Escríbenos!',
  '✨ Hola desde [negocio]. Hoy tenemos [promo] exclusiva para ti. ¿Te interesa? ¡Responde este mensaje! 📩',
  '💥 [negocio] te regala una sorpresa: [promo]. Disponible en [ciudad] por tiempo limitado. ¡Escríbenos y aprovecha! 🙌',
  '🎯 Esta semana en [negocio]: [promo] ⚡ Clientes de [ciudad] tienen acceso prioritario. ¡Reserva el tuyo ahora!',
  '💡 ¿Sabías que en [negocio] tienes [promo]? Es nuestra forma de decirte gracias por elegirnos en [ciudad]. 🙏',
];

const WA_INFORMATIVE = [
  '👋 Hola, somos [negocio]. Queremos recordarte que estamos disponibles en [ciudad] para servirte con [productos]. ¡Contáctanos cuando quieras! 😊',
  '📌 Novedad en [negocio]: ahora contamos con [productos] disponibles en [ciudad]. Visítanos o escríbenos para más información. ¡Te esperamos!',
  'ℹ️ En [negocio] ampliamos nuestro servicio en [ciudad]. Ahora ofrecemos [productos] con entrega rápida. ¡Escríbenos y te asesoramos!',
  '🕐 Recordatorio de [negocio]: nuestro horario de atención en [ciudad] es de lunes a sábado. Estamos aquí para servirte con [productos]. 📞 ¡Contáctanos!',
  '🌟 [negocio] en [ciudad] te informa: renovamos nuestro catálogo de [productos]. ¡Más opciones, misma calidad de siempre! Escríbenos para detalles.',
  '📊 En [negocio] nos actualizamos para servirte mejor en [ciudad]. Nuevos [productos] disponibles. ¿Quieres información? ¡Responde este mensaje! 💬',
];

const WA_RECOVERY = [
  '😊 ¡Hola! Te extrañamos en [negocio]. Hace tiempo que no sabemos de ti y queremos que regreses con una sorpresa especial: [promo]. ¡Te esperamos en [ciudad]! 🏠',
  '💌 Desde [negocio] en [ciudad] te enviamos un saludo especial. Hemos preparado [promo] pensando en ti. ¡Vuelve y redescubre lo que te gusta de nosotros!',
  '🔔 ¡Hola de nuevo! [negocio] te tiene una propuesta irresistible para que regreses: [promo]. Solo disponible en [ciudad] y solo para clientes como tú. ¡No te la pierdas!',
  '🤗 En [negocio] pensamos en ti. Sabemos que has faltado y queremos que vuelvas con [promo] exclusiva para clientes frecuentes de [ciudad]. ¡Cuéntanos, ¿qué te ha pasado?!',
];

// ─── Plantillas de Banner (8 variantes) ──────────────────────────────────────

const BANNER_TEMPLATES = [
  {
    title: 'Descubre lo Mejor de [negocio]',
    subtitle: '[productos] de calidad premium en [ciudad]. Servicio excepcional garantizado.',
    cta: 'Ver productos',
  },
  {
    title: '[negocio]: Tu Primera Opción en [ciudad]',
    subtitle: 'Calidad, confianza y la mejor experiencia en [tipo]. Visítanos hoy.',
    cta: 'Explorar ahora',
  },
  {
    title: '¡Oferta Imperdible en [negocio]!',
    subtitle: '[promo] — Solo por tiempo limitado para clientes de [ciudad].',
    cta: '¡Aprovechar oferta!',
  },
  {
    title: 'Bienvenido a [negocio]',
    subtitle: 'El destino número uno de [tipo] en [ciudad]. [productos] que superan expectativas.',
    cta: 'Conocer más',
  },
  {
    title: '[negocio] — Calidad Sin Compromiso',
    subtitle: 'Años de experiencia en [tipo] nos respaldan. Visítanos en [ciudad] y compruébalo.',
    cta: 'Contáctanos',
  },
  {
    title: 'Nuevos [productos] en [negocio]',
    subtitle: 'Lo más nuevo del mercado de [tipo] ya llegó a [ciudad]. Sé el primero en probarlo.',
    cta: 'Ver novedades',
  },
  {
    title: '[negocio] Premia tu Fidelidad',
    subtitle: 'Descuentos exclusivos para clientes frecuentes en [ciudad]. ¡Únete hoy!',
    cta: 'Unirme ahora',
  },
  {
    title: 'La Experiencia [negocio] te Espera',
    subtitle: 'Descubre por qué somos el referente de [tipo] en [ciudad]. [productos] excepcionales.',
    cta: '¡Visítanos!',
  },
];

// ─── Servicio ─────────────────────────────────────────────────────────────────

@Injectable()
export class TemplateEngineService extends IAiEngine {
  readonly engineName = 'template-engine';

  async generateBlog(ctx: BusinessContext): Promise<BlogResult> {
    const rawTitle = pick(BLOG_TITLES).replace('[año]', new Date().getFullYear().toString());
    const title = interpolate(rawTitle, ctx);
    const excerpt = interpolate(pick(BLOG_EXCERPTS), ctx);
    const paragraphs = pick(BLOG_PARAGRAPHS).map((p) => interpolate(p, ctx));
    const content = paragraphs.join('\n\n');
    const metaDescription = interpolate(pick(META_DESCRIPTIONS), ctx);
    const slug = slugify(title);

    return { title, excerpt, content, metaDescription, slug };
  }

  async generatePromotion(ctx: BusinessContext): Promise<PromotionResult> {
    const template = pick(PROMO_TEMPLATES);
    const [min, max] = template.discountRange;
    const discountPercent = Math.floor(Math.random() * (max - min + 1)) + min;

    return {
      title: interpolate(template.title, ctx),
      description: interpolate(template.description, ctx),
      discountPercent,
      cta: interpolate(template.cta, ctx),
    };
  }

  async generateWhatsapp(ctx: BusinessContext): Promise<WhatsappResult> {
    return {
      promotionalMessage: interpolate(pick(WA_PROMOTIONAL), ctx),
      informativeMessage: interpolate(pick(WA_INFORMATIVE), ctx),
      recoveryMessage: interpolate(pick(WA_RECOVERY), ctx),
    };
  }

  async generateBanner(ctx: BusinessContext): Promise<BannerResult> {
    const template = pick(BANNER_TEMPLATES);
    return {
      title: interpolate(template.title, ctx),
      subtitle: interpolate(template.subtitle, ctx),
      cta: interpolate(template.cta, ctx),
    };
  }
}
