from __future__ import annotations

from abc import ABC
from abc import abstractmethod
from dataclasses import dataclass
from typing import Callable
from typing import Dict
from typing import List
from typing import Optional


@dataclass
class ShapeTarget:
    """Target a specific shape for content filling"""
    shape_name: Optional[str] = None      # Target by name (e.g., "Google Shape;411;p72")
    shape_index: Optional[int] = None     # Target by index (0-based)
    content_key: Optional[str] = None     # Key in markdown content (e.g., "current_issues")
    placeholder: bool = False              # Is this shape a placeholder?
    description: Optional[str] = None     # Human-readable description
    fill_cols: Optional[List[int]] = None  # If set, only write to these column indices (skip others)


@dataclass
class SlideConfig:
    """Configuration for a specific slide"""
    slide_number: int
    layout_type: str                                    # 'title', 'content', 'custom', etc.

    # Content constraints
    content_types: Optional[List[str]] = None                    # Allowed: ['text', 'list', 'table', 'image']
    max_items: Optional[int] = None                    # Max list items or content blocks

    # Shape targeting
    shape_targets: Optional[List[ShapeTarget]] = None            # Specific shapes to fill

    # Placeholders info
    placeholder_count: int = 0
    has_title: bool = False
    has_subtitle: bool = False

    # Custom behavior
    custom_handler: Optional[Callable] = None          # Custom fill function
    protected: bool = False                            # Don't fill this slide

    # Metadata
    description: Optional[str] = None
    notes: Optional[str] = None

    def __post_init__(self):
        if self.content_types is None:
            self.content_types = ['text', 'list']
        if self.shape_targets is None:
            self.shape_targets = []


class BaseSlideTemplate(ABC):
    """Base class for template-specific configurations"""

    def __init__(self):
        self.slide_configs: Dict[int, SlideConfig] = {}
        self.protected_slides: List[int] = []
        self._initialize_configs()

    @abstractmethod
    def _initialize_configs(self):
        """Initialize slide configurations - implement in subclass"""
        pass

    def get_slide_config(self, slide_number: int) -> Optional[SlideConfig]:
        """Get configuration for a specific slide"""
        return self.slide_configs.get(slide_number, self._default_config(slide_number))

    def should_fill_slide(self, slide_number: int) -> bool:
        """Check if slide should be filled"""
        if slide_number in self.protected_slides:
            return False
        return True

    def _default_config(self, slide_number: int) -> SlideConfig:
        """Default configuration for slides without specific config"""
        return SlideConfig(
            slide_number=slide_number,
            layout_type='content',
            content_types=['text', 'list', 'table', 'image'],
            description='Default config - no specific configuration provided',
        )
